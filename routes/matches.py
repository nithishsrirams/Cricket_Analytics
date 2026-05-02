from datetime import date

from flask import Blueprint, jsonify, request

from app.models import Match, db

bp = Blueprint("matches", __name__)

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
    data = request.json

    new_match = Match(
        season_id=data["season_id"],
        venue_id=data["venue_id"],
        match_date=date.fromisoformat(data["match_date"]),
        format=data["format"],
        home_team_id=data["home_team_id"],
        away_team_id=data["away_team_id"],
        winner_team_id=data.get("winner_team_id"),
        toss_winner_team_id=data.get("toss_winner_team_id"),
    )

    db.session.add(new_match)
    db.session.commit()

    return jsonify({"message": "Match added"})
