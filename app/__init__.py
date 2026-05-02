from flask import Flask

from .config import Config
from .models import db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    from routes import Venues as venues
    from routes import analytics, batting, bowling, contracts, matches, players, seasons, teams

    app.register_blueprint(players.bp)
    app.register_blueprint(teams.bp)
    app.register_blueprint(matches.bp)
    app.register_blueprint(contracts.bp)
    app.register_blueprint(batting.bp)
    app.register_blueprint(bowling.bp)
    app.register_blueprint(venues.bp)
    app.register_blueprint(seasons.bp)
    app.register_blueprint(analytics.bp)

    return app