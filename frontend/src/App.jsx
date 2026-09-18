import React, { useState } from 'react';
import axios from 'axios';
import { ShieldAlert, CheckCircle2, Code2, Play, RefreshCw, Layers, Cpu, FileText, FolderGit2 } from 'lucide-react';

// Automatically use live Render backend URL in production, or localhost during local dev
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function App() {
  const [projectName, setProjectName] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/analyze-repo`, {
        project_name: projectName || 'GitHub Repository Audit',
        github_url: githubUrl
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze repository. Check URL or backend status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Professional Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="LintIQ Logo" className="w-12 h-12 rounded-2xl shadow-lg shadow-indigo-200" />
            <div>
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">Lint<span className="text-indigo-600">IQ</span></span>
              <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold">GitHub Code Intelligence Suite</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-[1400px] mx-auto px-8 py-12">
        
        {/* Hero Banner / Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight sm:text-5xl">
            Automated Repository Code Audit
          </h1>
          <p className="mt-4 text-slate-600 text-lg">
            Inspect architectural patterns, detect balanced maintainability smells, and calculate codebase quality scores instantly.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: GitHub Input Form (6 Cols) */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100 p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <Code2 className="w-6 h-6 text-indigo-600" /> Repository Target Configuration
              </h2>
              <span className="text-xs bg-indigo-50 text-indigo-600 font-bold px-3 py-1.5 rounded-lg">Public Repos</span>
            </div>
            
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Project Display Name</label>
                <input 
                  type="text" 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Flask-Backend-Core"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-5 py-4 text-slate-800 text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">Public GitHub Repository URL</label>
                <input 
                  type="url" 
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repository-name"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-5 py-4 text-slate-800 text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition font-mono"
                  required
                />
              </div>

              {/* Enhanced Rules Explanation Box */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <span className="font-bold text-slate-800 block mb-1 text-sm">Active AST Heuristic Audit Rules:</span>
                <p>&bull; <b>Long Function:</b> Flags functions exceeding 35 lines of code.</p>
                <p>&bull; <b>Too Many Parameters:</b> Flags functions accepting more than 5 arguments.</p>
                <p>&bull; <b>High Variable Complexity:</b> Detects functions with over 10 local assignment statements.</p>
                <p>&bull; <b>Empty Function Stub:</b> Flags unfinished functions containing only a `pass` statement.</p>
                <p>&bull; <b>Bare Except Clause:</b> Catches risky generic `except:` handlers masking runtime errors.</p>
                <p>&bull; <b>Global Variable Mutation:</b> Detects side-effect risks from the `global` keyword.</p>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 text-base disabled:opacity-50 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-current" />}
                {loading ? 'Fetching Repository & Running AST Audit...' : 'Run Repository Code Audit'}
              </button>
            </form>

            {error && (
              <div className="mt-6 p-5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Right Column: Analytics & Findings Dashboard (6 Cols) */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100 p-10 flex flex-col justify-between min-h-[620px]">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <Cpu className="w-6 h-6 text-indigo-600" /> Audit Telemetry & Results
              </h2>

              {result ? (
                <div className="space-y-6">
                  {/* Score Grid Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
                      <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Grade</div>
                      <div className={`text-4xl font-black mt-2 ${result.score === 'A' ? 'text-emerald-600' : result.score === 'B' ? 'text-amber-600' : 'text-rose-600'}`}>
                        {result.score}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
                      <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Total Lines</div>
                      <div className="text-3xl font-extrabold mt-2 text-slate-800">{result.total_lines}</div>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
                      <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">Smells</div>
                      <div className={`text-3xl font-extrabold mt-2 ${result.smells_found > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {result.smells_found}
                      </div>
                    </div>
                  </div>

                  {/* Scanned Files Section */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      <FolderGit2 className="w-4 h-4 text-indigo-600" /> Successfully Scanned Files ({result.files_scanned.length})
                    </div>
                    <div className="max-h-28 overflow-y-auto space-y-1 pr-1 font-mono text-xs text-slate-700">
                      {result.files_scanned.map((file, idx) => (
                        <div key={idx} className="bg-white px-3 py-1 rounded border border-slate-200 flex items-center justify-between">
                          <span>{file}</span>
                          <span className="text-[10px] text-emerald-600 font-sans font-semibold bg-emerald-50 px-2 py-0.5 rounded">Parsed</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Smells List Section */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Detected Code Smells</h3>
                    {result.smells.length === 0 ? (
                      <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50 p-5 rounded-2xl border border-emerald-200">
                        <CheckCircle2 className="w-6 h-6 shrink-0" />
                        <span className="text-base font-medium">No code smells detected! High maintainability score.</span>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2">
                        {result.smells.map((smell, index) => (
                          <div key={index} className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 flex items-start gap-4">
                            <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-rose-900 text-base">{smell.smell_type}</span>
                                <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2.5 py-1 rounded-lg">Line {smell.line_number}</span>
                              </div>
                              <p className="text-slate-800 text-xs font-mono mt-1 bg-white/80 p-1.5 rounded border border-rose-100">{smell.file_name}</p>
                              <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">{smell.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center text-slate-400 text-center px-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    <FileText className="w-10 h-10" />
                  </div>
                  <p className="text-base font-semibold text-slate-700">No repository audited yet</p>
                  <p className="text-sm text-slate-400 mt-1">Enter a public GitHub repository URL on the left to run the code audit.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;