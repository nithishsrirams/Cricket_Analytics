from flask import Blueprint, jsonify, request

from app.models import Team, db

bp = Blueprint("teams", __name__)

@bp.route("/teams", methods=["GET"])
def get_teams():
    teams = Team.query.all()
    return jsonify([
        {
            "id": t.team_id,
            "name": t.name
        } for t in teams
    ])


@bp.route("/teams", methods=["POST"])
def add_team():
    data = request.json

    new_team = Team(
        name=data["name"],
        league=data["league"],
        home_venue_id=data.get("home_venue_id"),
        owner=data.get("owner"),
        coach=data.get("coach"),
    )

    db.session.add(new_team)
    db.session.commit()

    return jsonify({"message": "Team added"})