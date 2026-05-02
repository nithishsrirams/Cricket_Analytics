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
    data = request.json

    new_season = Season(
        year=data["year"],
        league=data["league"],
        playoff_format=data.get("playoff_format"),
        total_teams=data["total_teams"],
    )

    db.session.add(new_season)
    db.session.commit()

    return jsonify({"message": "Season added"})