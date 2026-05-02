from flask import Blueprint, jsonify, request

from app.models import BowlingStat, db

bp = Blueprint("bowling", __name__)

@bp.route("/bowling_stats", methods=["GET"])
def get_bowling_stats():
    stats = BowlingStat.query.all()
    return jsonify([
        {
            "id": s.bowling_stat_id,
            "match_id": s.match_id,
            "player_id": s.player_id,
            "overs": float(s.overs),
            "wickets": s.wickets,
            "runs_conceded": s.runs_conceded,
            "extras": s.extras
        } for s in stats
    ])


@bp.route("/bowling_stats", methods=["POST"])
def add_bowling_stat():
    data = request.json

    new_stat = BowlingStat(
        match_id=data["match_id"],
        player_id=data["player_id"],
        overs=data["overs"],
        wickets=data["wickets"],
        runs_conceded=data["runs_conceded"],
        extras=data["extras"],
    )

    db.session.add(new_stat)
    db.session.commit()

    return jsonify({"message": "Bowling stat added"})