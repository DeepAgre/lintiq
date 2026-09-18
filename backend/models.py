from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    runs = relationship("AnalysisRun", back_populates="project")

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    score = Column(String)  # e.g., "A", "B", "C"
    total_lines = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="runs")
    smells = relationship("CodeSmell", back_populates="run")

class CodeSmell(Base):
    __tablename__ = "code_smells"
    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("analysis_runs.id"))
    file_name = Column(String)
    smell_type = Column(String)  # e.g., "Long Function", "Deep Nesting"
    line_number = Column(Integer)
    description = Column(Text)

    run = relationship("AnalysisRun", back_populates="smells")