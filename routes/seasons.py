from flask import Blueprint, jsonify, request

from app.models import Season, db

bp = Blueprint("seasons", __name__)


def _season_payload(data):
    league = (data.get("league") or "").strip()
    playoff_format = (data.get("playoff_format") or "").strip() or None

    try:
        year = int(data.get("year"))
        total_teams = int(data.get("total_teams"))
    except (TypeError, ValueError):
        return None, jsonify({"message": "Year and total teams must be valid"}), 400

    if not league:
        return None, jsonify({"message": "League is required"}), 400

    if total_teams < 0:
        return None, jsonify({"message": "Total teams must be zero or greater"}), 400

    return {
        "year": year,
        "league": league,
        "playoff_format": playoff_format,
        "total_teams": total_teams,
    }, None, None


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
    payload, error_response, status_code = _season_payload(data)
    if error_response:
        return error_response, status_code

    new_season = Season(
        **payload,
    )

    db.session.add(new_season)
    db.session.commit()

    return jsonify({"message": "Season added"})


@bp.route("/seasons/<int:id>", methods=["PUT"])
def update_season(id):
    season = Season.query.get_or_404(id)
    data = request.get_json() or {}
    payload, error_response, status_code = _season_payload(data)
    if error_response:
        return error_response, status_code

    season.year = payload["year"]
    season.league = payload["league"]
    season.playoff_format = payload["playoff_format"]
    season.total_teams = payload["total_teams"]

    db.session.commit()

    return jsonify({"message": "Season updated"})


@bp.route("/seasons/<int:id>", methods=["DELETE"])
def delete_season(id):
    season = Season.query.get_or_404(id)
    db.session.delete(season)
    db.session.commit()

    return jsonify({"message": "Season deleted"})
