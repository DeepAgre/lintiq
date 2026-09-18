from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Replace this with your PostgreSQL connection string later (e.g., Supabase/Neon URL)
DATABASE_URL = "postgresql://postgres:root@localhost:5432/codesmells"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()