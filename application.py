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


@socketio.on("create room")
def createRoom(room):
    roomTaken = True
    selection = room["newRoom"]
    if selection not in chatRooms:
        chatRooms.append(selection)
        roomTaken = False  
    emit("announce room", {"selection": selection, "roomTaken": roomTaken}, broadcast=True)

# @socketio.on("new message")
# def newMessage(message):
#     selection = message["selection"]
#     emit("announce message", {"selection": selection}, broadcast=True)


if __name__ == "__main__":
    socketio.run(app, debug=True)