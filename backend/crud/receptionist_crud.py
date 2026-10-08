from models import Receptionist
from mail import *

def validate_receptionist(rec, db) :
    return db.query(Receptionist).filter(
        Receptionist.username == rec.username,
        Receptionist.password == rec.password,
        Receptionist.status == "active"
    ).first()
    

def add_receptionist(rec, db):
    if db.query(Receptionist).filter(Receptionist.username == rec.username).first():
        return {"message": "A receptionist with this username already exists.", "email_sent": False}
    if db.query(Receptionist).filter(Receptionist.contact == rec.contact).first():
        return {"message": "A receptionist with this contact number already exists.", "email_sent": False}

    newRec = Receptionist(
        name = rec.name,
        dob = rec.dob,
        gender = rec.gender,
        email = rec.email,
        contact = rec.contact,
        username = rec.username,
        password = rec.password,
        shift = rec.shift,
        status = rec.status or "Active",
    )
    
    db.add(newRec)
    db.commit()
    db.refresh(newRec)
    
    email_sent = send_credentials_email( to_email=newRec.email, name=newRec.name, role="Receptionist", username=newRec.username, password=newRec.password)
        
    return { "message": "Doctor added successfully", "email_sent": email_sent }


def get_receptionist(db) :
    return db.query(Receptionist).all()


def get_one_receptionist(rid, db) :
    return db.query(Receptionist).filter(Receptionist.rid == rid).first()


def update_receptionist(rid, rec, db) :
    exist_rec = db.query(Receptionist).filter(Receptionist.rid == rid).first()
    
    if exist_rec is None :
        return {"message" : "No receptionist with this Id"}
    
    exist_rec.name = rec.name
    exist_rec.dob = rec.dob 
    exist_rec.gender = rec.gender 
    exist_rec.email = rec.email
    exist_rec.contact = rec.contact
    exist_rec.username = rec.username
    exist_rec.password = rec.password
    exist_rec.shift = rec.shift
    exist_rec.status = rec.status
    
    db.commit()
    db.refresh(exist_rec)
    
    return exist_rec


def delete_receptionist(rid, db) :
    exist_rec = db.query(Receptionist).filter(Receptionist.rid == rid).first()
    
    if exist_rec is None :
        return {"message" : "No receptionist with this Id"}
    
    db.delete(exist_rec)
    db.commit()
    
    return exist_rec
    
    
def update_receptionist_status(rid, status, db) :
    exist_rec = db.query(Receptionist).filter(Receptionist.rid == rid).first()
    
    if exist_rec is None:
        return {"message" : "No receptionist found"}

    exist_rec.status = status
    
    db.commit()
    db.refresh(exist_rec)
        
    return exist_rec
