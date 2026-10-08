from models import Doctor
from mail import *

def validate_doctor(doc, db) :
    return db.query(Doctor).filter(
        Doctor.username == doc.username,
        Doctor.password == doc.password,
        Doctor.status == "active"
        ).first()


def add_doctor(doc, db) :
    if db.query(Doctor).filter(Doctor.username == doc.username).first():
        return {"message": "A doctor with this username already exists.", "email_sent": False}
    if db.query(Doctor).filter(Doctor.contact == doc.contact).first():
        return {"message": "A doctor with this contact number already exists.", "email_sent": False}

    newDoc = Doctor(
        name = doc.name,
        dob = doc.dob,
        gender = doc.gender,
        email = doc.email,
        contact = doc.contact,
        specialization = doc.specialization,
        avg_time = doc.avg_time,
        username = doc.username,
        password = doc.password,
        status = doc.status or "active",
    )
    
    db.add(newDoc)
    db.commit()
    db.refresh(newDoc)
    
    email_sent = send_credentials_email( to_email=newDoc.email, name=newDoc.name, role="Doctor", username=newDoc.username, password=newDoc.password)
    
    return { "message": "Doctor added successfully", "email_sent": email_sent }


def get_doctors(db) :
    return db.query(Doctor).all()


def get_one_doctor(did, db) :
    return db.query(Doctor).filter(Doctor.did == did).first()


def update_doctor(did, doc, db) :
    exits_doctor =  db.query(Doctor).filter(Doctor.did == did).first()
    
    if exits_doctor is None :
        return {"message" : "No Doctor with this Id"}
    
    exits_doctor.name = doc.name
    exits_doctor.dob = doc.dob
    exits_doctor.gender = doc.gender
    exits_doctor.email = doc.email
    exits_doctor.contact = doc.contact
    exits_doctor.specialization = doc.specialization
    exits_doctor.avg_time = doc.avg_time
    exits_doctor.username = doc.username
    exits_doctor.password = doc.password
    exits_doctor.status = doc.status
    
    db.commit()
    db.refresh(exits_doctor)
    
    return exits_doctor


def update_doctor_status(id, status, db) :
    exits_doctor = db.query(Doctor).filter(Doctor.did == id).first()

    if exits_doctor is None :
        return {"message" : "No doctor found"}
    
    exits_doctor.status = status
    
    db.commit()
    db.refresh(exits_doctor)
    
    return exits_doctor
    
    
def delete_doctor(did, db) :
    exits_doctor = db.query(Doctor).filter(Doctor.did == did).first()
    
    if exits_doctor is None :
        return {"message" : "Doctos not found with this Id"}
    
    db.delete(exits_doctor)
    db.commit()
    
    return exits_doctor