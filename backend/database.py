from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

dbUrl = "postgresql+psycopg://postgres:root@localhost:9000/opd"

engine = create_engine(dbUrl)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()

try : 
    with engine.connect() as connection :
        print("Database connected !")
except :
    print("Database not Connected ?")


def get_db() :
    db = SessionLocal()
    try :
        yield db
    finally :
        db.close()
