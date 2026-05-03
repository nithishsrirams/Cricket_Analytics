from flask import Blueprint, jsonify, request

from app.models import Season, db

bp = Blueprint("seasons", __name__)

@bp.route("/seasons", methods=["GET"])
def get_seasons():
    seasons = Season.query.all()
    return jsonify([
        {
            "id": s.season_id,
            "year": s.year,
            "league": s.league,
            "playoff_format": s.playoff_format,
            "total_teams": s.total_teams
        } for s in seasons
    ])


@bp.route("/seasons", methods=["POST"])
def add_season():
    data = request.get_json() or {}
    league = (data.get("league") or "").strip()
    playoff_format = (data.get("playoff_format") or "").strip() or None

    try:
        year = int(data.get("year"))
        total_teams = int(data.get("total_teams"))
    except (TypeError, ValueError):
        return jsonify({"message": "Year and total teams must be valid"}), 400

    if not league:
        return jsonify({"message": "League is required"}), 400

    if total_teams < 0:
        return jsonify({"message": "Total teams must be zero or greater"}), 400

    new_season = Season(
        year=year,
        league=league,
        playoff_format=playoff_format,
        total_teams=total_teams,
    )

    db.session.add(new_season)
    db.session.commit()

    return jsonify({"message": "Season added"})
