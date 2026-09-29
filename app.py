"""Tiny Flask server for local preview. The site itself is plain HTML/CSS/JS."""
from flask import Flask, send_from_directory, abort

app = Flask(__name__, static_folder=None)
ALLOWED = {"index.html", "style.css", "script.js"}

@app.route("/")
def home():
    return send_from_directory(".", "index.html")

@app.route("/<path:name>")
def files(name):
    if name not in ALLOWED:
        abort(404)
    return send_from_directory(".", name)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
