from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db, migrate, jwt


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    CORS(app)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    @app.route("/")
    def home():
        return {
            "message": "Library Management System API is running successfully"
        }

    return app