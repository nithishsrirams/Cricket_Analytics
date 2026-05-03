from flask import Blueprint, jsonify, request

from app.models import Team, Venue, db

bp = Blueprint("teams", __name__)


def _optional_int(value):
    if value in (None, ""):
        return None
    return int(value)


@bp.route("/teams", methods=["GET"])
def get_teams():
    teams = Team.query.all()
    return jsonify([
        {
            "id": t.team_id,
            "name": t.name,
            "league": t.league,
            "home_venue_id": t.home_venue_id,
            "owner": t.owner,
            "coach": t.coach,
        } for t in teams
    ])


@bp.route("/teams", methods=["POST"])
def add_team():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    league = (data.get("league") or "").strip()
    owner = (data.get("owner") or "").strip() or None
    coach = (data.get("coach") or "").strip() or None

    try:
        home_venue_id = _optional_int(data.get("home_venue_id"))
    except (TypeError, ValueError):
        return jsonify({"message": "Home venue must be valid"}), 400

    if not name or not league:
        return jsonify({"message": "Team name and league are required"}), 400

    if home_venue_id is not None and db.session.get(Venue, home_venue_id) is None:
        return jsonify({"message": "Selected home venue does not exist"}), 400

    new_team = Team(
        name=name,
        league=league,
        home_venue_id=home_venue_id,
        owner=owner,
        coach=coach,
    )

    db.session.add(new_team)
    db.session.commit()

    return jsonify({"message": "Team added"})
