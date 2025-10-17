from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# replace credentials with your own
DATABASE_URL = "mysql+pymysql://root:schoolimportantkhan@localhost:3306/jacksdeli"

engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()
