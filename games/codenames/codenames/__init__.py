import os

from flask import Flask
from flask_compress import Compress
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)
Compress(app)

DEFAULT_GAME_MODES = 'pictures,classic_de,classic_en,classic_en-undercover'

app.config['GAME_MODES'] = os.getenv('GAME_MODES', DEFAULT_GAME_MODES).lower().split(',')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', os.urandom(24).hex())
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'LAX'
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['TEMPLATES_AUTO_RELOAD'] = True

app.game_modes = []

for mode in app.config['GAME_MODES']:
    if mode == 'pictures':
        DISPLAY_NAME = 'Pictures'
    elif mode.startswith('classic_'):
        lang = mode.split('classic_', 1)[1]
        DISPLAY_NAME = f'Classic ({lang})'
    else:
        continue
    app.game_modes.append((mode, DISPLAY_NAME))

socketio = SocketIO(app)
with app.app_context():
    db = SQLAlchemy(app)

    from . import models, routes, helper, websocket  # noqa: F401

    #: create database if not exists
    db.create_all()

if __name__ == '__main__':
    #: start websocket server
    socketio.run(app, host='0.0.0.0', port=5000)
