from flask import Blueprint, jsonify, request

from app.models import Team, Venue, db

bp = Blueprint("teams", __name__)


def _optional_int(value):
    if value in (None, ""):
        return None
    return int(value)


def _team_payload(data):
    name = (data.get("name") or "").strip()
    league = (data.get("league") or "").strip()
    owner = (data.get("owner") or "").strip() or None
    coach = (data.get("coach") or "").strip() or None

    try:
        home_venue_id = _optional_int(data.get("home_venue_id"))
    except (TypeError, ValueError):
        return None, jsonify({"message": "Home venue must be valid"}), 400

    if not name or not league:
        return None, jsonify({"message": "Team name and league are required"}), 400

    if home_venue_id is not None and db.session.get(Venue, home_venue_id) is None:
        return None, jsonify({"message": "Selected home venue does not exist"}), 400

    return {
        "name": name,
        "league": league,
        "home_venue_id": home_venue_id,
        "owner": owner,
        "coach": coach,
    }, None, None


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
    payload, error_response, status_code = _team_payload(data)
    if error_response:
        return error_response, status_code

    new_team = Team(
        **payload,
    )

    db.session.add(new_team)
    db.session.commit()

    return jsonify({"message": "Team added"})


@bp.route("/teams/<int:id>", methods=["PUT"])
def update_team(id):
    team = Team.query.get_or_404(id)
    data = request.get_json() or {}
    payload, error_response, status_code = _team_payload(data)
    if error_response:
        return error_response, status_code

    team.name = payload["name"]
    team.league = payload["league"]
    team.home_venue_id = payload["home_venue_id"]
    team.owner = payload["owner"]
    team.coach = payload["coach"]

    db.session.commit()

    return jsonify({"message": "Team updated"})


@bp.route("/teams/<int:id>", methods=["DELETE"])
def delete_team(id):
    team = Team.query.get_or_404(id)
    db.session.delete(team)
    db.session.commit()

    return jsonify({"message": "Team deleted"})
