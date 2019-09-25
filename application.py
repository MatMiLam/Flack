import os

from flask import Flask, session, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)
FLASK_DEBUG=1


@app.route("/")
def index():
    return render_template("index.html")
