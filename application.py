import os

from flask import Flask, session, render_template, request, request, redirect
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

    def getMessages():
        return self.messages

    def addMessage(self, user, message):
        self.messages[message] = user
        print(len(messages))
        

chatRooms = ["General", "News", "Sports", "Tech"]

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
    return render_template("chat.html", chatRooms=chatRooms)

@app.route("/changeRoom")
def changeRoom():
    """AJAX call. Return messages for selected room"""

    if request.method == "GET":
        room = request.args.get("room")
        messages = room.getMessages()
        return messages


@socketio.on("create room")
def createRoom(data):       

    roomTaken = True
    selection = data["newRoom"]
    if selection not in chatRooms:
        chatRooms.append(selection)
        data["newRoom"] = ChatRoom(selection)
        roomTaken = False 
     
    emit("announce room", {"selection": selection, "roomTaken": roomTaken}, broadcast=True)


@socketio.on("create message")
def createRoom(data):    

    print()
    print(data)
    print(session["user_id"])
    print()    
    message = data["newMessage"]
    room = data["room"]
     
    emit("announce message", {"message": message, "room": room, "user": session["user_id"]}, broadcast=True)

# @socketio.on("change room")
# def changeRoom(data):
#     ChatRoom = data["roomName"]
#     messages = ChatRoom.getMessages()
#     emit("announce room change", {"ChatRoom": ChatRoom, "messages": messages}, broadcast=True)

# @socketio.on("new message")
# def newMessage(message):
#     selection = message["selection"]
#     emit("announce message", {"selection": selection}, broadcast=True)


if __name__ == "__main__":
    socketio.run(app, debug=True)