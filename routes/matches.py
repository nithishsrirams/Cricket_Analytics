from datetime import date

from flask import Blueprint, jsonify, request

from app.models import Match, Season, Team, Venue, db

bp = Blueprint("matches", __name__)


def _missing_record(model, record_id):
    return record_id is None or db.session.get(model, record_id) is None


def _optional_int(value):
    if value in (None, ""):
        return None
    return int(value)

@bp.route("/matches", methods=["GET"])
def get_matches():
    matches = Match.query.all()
    return jsonify([
        {
            "id": m.match_id,
            "season_id": m.season_id,
            "venue_id": m.venue_id,
            "match_date": str(m.match_date),
            "format": m.format,
            "home_team_id": m.home_team_id,
            "away_team_id": m.away_team_id,
            "winner_team_id": m.winner_team_id,
            "toss_winner_team_id": m.toss_winner_team_id,
        } for m in matches
    ])


@bp.route("/matches", methods=["POST"])
def add_match():
    data = request.get_json() or {}

    try:
        season_id = int(data.get("season_id"))
        venue_id = int(data.get("venue_id"))
        home_team_id = int(data.get("home_team_id"))
        away_team_id = int(data.get("away_team_id"))
        winner_team_id = _optional_int(data.get("winner_team_id"))
        toss_winner_team_id = _optional_int(data.get("toss_winner_team_id"))
        match_date = date.fromisoformat(data.get("match_date", ""))
    except (TypeError, ValueError):
        return jsonify({"message": "Season, venue, date, teams, and format must be valid"}), 400

    match_format = (data.get("format") or "").strip()

    if not match_format:
        return jsonify({"message": "Format is required"}), 400

    if home_team_id == away_team_id:
        return jsonify({"message": "Home and away teams must be different"}), 400

    if _missing_record(Season, season_id):
        return jsonify({"message": "Selected season does not exist"}), 400

    if _missing_record(Venue, venue_id):
        return jsonify({"message": "Selected venue does not exist"}), 400

    if _missing_record(Team, home_team_id) or _missing_record(Team, away_team_id):
        return jsonify({"message": "Selected teams must exist"}), 400

    allowed_team_ids = {home_team_id, away_team_id}
    if winner_team_id is not None and winner_team_id not in allowed_team_ids:
        return jsonify({"message": "Winner must be the home team or away team"}), 400

    if toss_winner_team_id is not None and toss_winner_team_id not in allowed_team_ids:
        return jsonify({"message": "Toss winner must be the home team or away team"}), 400

    new_match = Match(
        season_id=season_id,
        venue_id=venue_id,
        match_date=match_date,
        format=match_format,
        home_team_id=home_team_id,
        away_team_id=away_team_id,
        winner_team_id=winner_team_id,
        toss_winner_team_id=toss_winner_team_id,
    )

    db.session.add(new_match)
    db.session.commit()

    return jsonify({"message": "Match added"})
