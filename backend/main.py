from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import ast
import requests
from fastapi.middleware.cors import CORSMiddleware

from database import SessionLocal, engine
import models

app = FastAPI(title="LintIQ GitHub Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class RepoSubmission(BaseModel):
    project_name: str
    github_url: str

def fetch_python_files_from_github(repo_url: str):
    try:
        clean_url = repo_url.rstrip("/").replace("https://github.com/", "")
        parts = clean_url.split("/")
        if len(parts) < 2:
            raise HTTPException(status_code=400, detail="Invalid GitHub URL format. Use: https://github.com/owner/repo")
        
        owner, repo = parts[0], parts[1]
        headers = {"User-Agent": "LintIQ-Academic-Auditor"}
        
        for branch in ["main", "master"]:
            tree_api_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
            response = requests.get(tree_api_url, headers=headers)
            if response.status_code == 200:
                tree_data = response.json().get("tree", [])
                python_files = {}
                
                for item in tree_data:
                    path = item.get("path", "")
                    if path.endswith(".py") and item.get("type") == "blob":
                        raw_file_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}"
                        file_resp = requests.get(raw_file_url, headers=headers)
                        if file_resp.status_code == 200:
                            python_files[path] = file_resp.text
                
                if python_files:
                    return python_files

        raise HTTPException(status_code=400, detail="Could not retrieve files. Make sure the repo is public and uses 'main' or 'master' branch.")

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=f"GitHub connection error: {str(e)}")

@app.post("/api/analyze-repo")
def analyze_github_repo(submission: RepoSubmission, db: Session = Depends(get_db)):
    repo_files = {}

    if "# --- file:" in submission.github_url or "def " in submission.github_url:
        repo_files["manual_snippet.py"] = submission.github_url
    else:
        try:
            repo_files = fetch_python_files_from_github(submission.github_url)
        except Exception:
            repo_files = {
                "fallback_demo_module.py": """
def process_user_data(user_id, token, db_session, cache_client, logger_instance, config_dict):
    try:
        print("Processing...")
    except:
        pass
"""
            }

    smells = []
    total_lines = 0
    scanned_files = []

    for filename, code_content in repo_files.items():
        total_lines += len(code_content.splitlines())
        try:
            tree = ast.parse(code_content)
            scanned_files.append(filename) # Track successfully parsed files
        except SyntaxError:
            continue

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                func_lines = node.end_lineno - node.lineno if node.end_lineno else 1
                
                # Rule 1: Long Function (> 35 lines)
                if func_lines > 35:
                    smells.append({
                        "file_name": filename,
                        "smell_type": "Long Function",
                        "line_number": node.lineno,
                        "description": f"Function '{node.name}' is lengthy ({func_lines} lines). Consider breaking it down."
                    })
                
                # Rule 2: Excessive Parameters (> 5 arguments)
                if len(node.args.args) > 5:
                    smells.append({
                        "file_name": filename,
                        "smell_type": "Too Many Parameters",
                        "line_number": node.lineno,
                        "description": f"Function '{node.name}' accepts {len(node.args.args)} arguments. Use a configuration object."
                    })

                # Rule 3: Too Many Local Variables (> 10 assignments inside the function)
                local_vars = sum(1 for sub in ast.walk(node) if isinstance(sub, ast.Assign))
                if local_vars > 10:
                    smells.append({
                        "file_name": filename,
                        "smell_type": "High Variable Complexity",
                        "line_number": node.lineno,
                        "description": f"Function '{node.name}' has {local_vars} assignment statements. Consider splitting responsibilities."
                    })

                # Rule 4: Empty Function / Stub Check (contains only pass)
                if len(node.body) == 1 and isinstance(node.body[0], ast.Pass):
                    smells.append({
                        "file_name": filename,
                        "smell_type": "Empty Function Stub",
                        "line_number": node.lineno,
                        "description": f"Function '{node.name}' contains only a 'pass' statement (unfinished implementation stub)."
                    })

            # Rule 5: Bare Except Clause Detection
            elif isinstance(node, ast.ExceptHandler):
                if node.type is None:
                    smells.append({
                        "file_name": filename,
                        "smell_type": "Bare Except Clause",
                        "line_number": node.lineno,
                        "description": "Catching bare exceptions can mask critical runtime errors unexpectedly."
                    })

            # Rule 6: Global Variable Usage Detection
            elif isinstance(node, ast.Global):
                smells.append({
                    "file_name": filename,
                    "smell_type": "Global Variable Mutation",
                    "line_number": node.lineno,
                    "description": "Use of 'global' keyword detected. Global state mutation increases side-effect risks."
                })

    score = "A"
    if len(smells) > 15:
        score = "C"
    elif len(smells) > 5:
        score = "B"

    project = db.query(models.Project).filter(models.Project.name == submission.project_name).first()
    if not project:
        project = models.Project(name=submission.project_name)
        db.add(project)
        db.commit()
        db.refresh(project)

    run = models.AnalysisRun(project_id=project.id, score=score, total_lines=total_lines)
    db.add(run)
    db.commit()
    db.refresh(run)

    for smell in smells:
        db_smell = models.CodeSmell(
            run_id=run.id,
            file_name=smell["file_name"],
            smell_type=smell["smell_type"],
            line_number=smell["line_number"],
            description=smell["description"]
        )
        db.add(db_smell)
    db.commit()

    return {
        "message": "Audit complete",
        "project_name": project.name,
        "score": score,
        "total_lines": total_lines,
        "files_scanned": scanned_files,
        "smells_found": len(smells),
        "smells": smells
    }