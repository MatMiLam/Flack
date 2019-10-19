import os

from flask import Flask, session, render_template, request, request, redirect, jsonify
from flask_socketio import SocketIO, emit
from flask_session import Session

from helpers import login_required

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["SESSION_TYPE"] = "filesystem"
socketio = SocketIO(app)
Session(app)

class ChatRoom(object):
    messages = {}
    def __init__(self, room):
        self.room = room
        self.messages[self.room] = {}

    def getMessages(self):
        return self.messages[self.room]

    def addMessage(self, user, message):
        # self.messages[message] = user
        self.messages[self.room][message] = user
        print(len(self.messages))
        
# Establish default rooms 
General = ChatRoom("General")
News = ChatRoom("News")

# General.addMessage("user1", "This is message 1 for General chat")
# General.addMessage("user2", "This is message 2 for General chat")
# News.addMessage("user1", "This is message 1 for News chat")
# News.addMessage("user2", "This is message 2 for News chat")

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


@app.route("/")
@login_required
def chat():
    roomList = chatRooms.keys()
    return render_template("chat.html", chatRooms=roomList)


@app.route("/changeRoom", methods=["GET", "POST"])
def changeRoom():
    """AJAX call. Return messages for selected room"""

    if request.method == "POST":
        room = request.form.get("room")
        print("room test")
        print(room)
        messages = chatRooms[room].getMessages()

        print()
        print(messages)
        print("test")

        return jsonify({"messages": messages, "room": room})


@socketio.on("create room")
def createRoom(data):       

    roomTaken = True
    selection = data["newRoom"]
    if selection not in chatRooms:
        data["newRoom"] = ChatRoom(selection)
        chatRooms[selection] = data["newRoom"]
        roomTaken = False        

    print()
    print(chatRooms)
    print()
    emit("announce room", {"selection": selection, "roomTaken": roomTaken}, broadcast=True)


@socketio.on("create message")
def createMessage(data):    
   
    message = data["newMessage"]
    room = data["room"]    
    chatRooms[room].addMessage(session["user_id"], message)  
    print()
    print(type(chatRooms[room]))
    print(chatRooms[room].getMessages())
    print()
    

     
    emit("announce message", {"message": message, "room": room, "user": session["user_id"]}, broadcast=True)


if __name__ == "__main__":
    socketio.run(app, debug=True)