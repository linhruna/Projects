import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

cred = credentials.Certificate("ServiceAccountKey.json")
firebase_admin.initialize_app(cred,{
    'databaseURL':"https://faceattendance-582c2-default-rtdb.firebaseio.com/"

})
ref = db.reference('Students')
data ={
    "1":
        {
            "name": "Elon Musk",
            "major":"Robotics",
            "starting_year":2017,
            "total_attendace":6,
            "standing":"G",
            "year":4,
            "last_attendace_time":"2025-2-17 00:54:34"
        },
    "2":
        {
            "name": "My bf",
            "major": "Robotics",
            "starting_year": 2017,
            "total_attendace": 6,
            "standing": "G",
            "year": 4,
            "last_attendace_time": "2025-2-17 06:54:34"
        },
    "3":
        {
            "name": "My husband",
            "major": "Robotics",
            "starting_year": 2017,
            "total_attendace": 6,
            "standing": "G",
            "year": 4,
            "last_attendace_time": "2025-2-17 05:54:34"
        },
}
for key,value in data.items():
    ref.child(key).set(value)
