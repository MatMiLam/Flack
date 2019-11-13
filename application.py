import os

from flask import Flask, session, render_template, request, request, redirect, jsonify
from flask_socketio import SocketIO, emit
from flask_session import Session
# from collections import OrderedDict
from datetime import datetime

from helpers import login_required

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["SESSION_TYPE"] = "filesystem"
socketio = SocketIO(app, logger=True, engineio_logger=True)
Session(app)


class ChatRoom(object):
    
    def __init__(self, room):
        self.room = room
        self.messages = []        
        print(f"***** New {room} class created *****")

    def getMessages(self):
        return self.messages
    
    def addMessage(self, user, message, timeStamp):                
        self.messages.append({user: [message,timeStamp]})               
        while len(self.messages) > 100:
            del(self.messages[0])   
        
        
# Establish default rooms 
General = ChatRoom("General")
News = ChatRoom("News")


# Store rooms in a dictionary to allow for easier access to the ChatRoom class 
chatRooms = {"General":General, "News": News}


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""  

    if request.method == "GET":
        return render_template("login.html")

    if request.method == "POST":
        username = request.form.get("username")
        session["user_id"] = username
        return redirect("/")  


@app.route("/", methods=["GET"])
@login_required
def chat():
    
    roomList = chatRooms.keys()
    return render_template("chat.html", chatRooms=roomList)


@app.route("/changeRoom", methods=["POST"])
def changeRoom():
    """AJAX call. Return messages for selected room"""

    if request.method == "POST":
        
        room = request.form.get("room")  
        oldRoom = request.form.get("oldRoom")             
        messages = chatRooms[room].getMessages()        
        currentUser = session["user_id"]      
        print(f"***** Changing to {room} *****")
        
        socketio.emit("announce user", {"currentUser": currentUser, "room": room, "oldRoom": oldRoom}, broadcast=True)
       
        return jsonify({"messages": messages, "room": room})


@socketio.on("create room")
def createRoom(data):       

    roomTaken = True
    selection = data["newRoom"].replace(" ","-")
    if selection not in chatRooms:
        data["newRoom"] = ChatRoom(selection)
        chatRooms[selection] = data["newRoom"]
        roomTaken = False   
    print(f"***** Creating {selection} room *****")    
    
    emit("announce room", {"selection": selection, "roomTaken": roomTaken}, broadcast=True)
    
# Attempt to get the user announcement after the room change 
# @socketio.on("room change")
# def roomChange(data):

#     room = data["room"]    
#     oldRoom = data["oldRoom"]   
#     currentUser = session["user_id"]      

#     emit("announce user", {"currentUser": currentUser, "room": room, "oldRoom": oldRoom}, broadcast=True)


@socketio.on("create message")
def createMessage(data):    
   
    message = data["newMessage"]
    room = data["room"]    
    user = session["user_id"]
    timeStamp = str(datetime.now().replace(microsecond=0))
    chatRooms[room].addMessage(session["user_id"], message, timeStamp)  
    print(f"***** Creating a new message *****")
    print(f"{room} {user} {message}")
              
    emit("announce message", {"message": message, "room": room, "user": user, "timeStamp": timeStamp}, broadcast=True)


if __name__ == "__main__":
    socketio.run(app, debug=True)