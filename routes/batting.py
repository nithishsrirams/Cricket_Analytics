from flask import Blueprint, jsonify, request

from app.models import BattingStat, db

bp = Blueprint("batting", __name__)

@bp.route("/batting_stats", methods=["GET"])
def get_batting_stats():
    stats = BattingStat.query.all()
    return jsonify([
        {
            "id": s.batting_stat_id,
            "match_id": s.match_id,
            "player_id": s.player_id,
            "runs": s.runs,
            "balls": s.balls_faced,
            "fours": s.fours,
            "sixes": s.sixes,
            "not_out": s.not_out
        } for s in stats
    ])


@bp.route("/batting_stats", methods=["POST"])
def add_batting_stat():
    data = request.json

    new_stat = BattingStat(
        match_id=data["match_id"],
        player_id=data["player_id"],
        runs=data["runs"],
        balls_faced=data["balls_faced"],
        fours=data["fours"],
        sixes=data["sixes"],
        not_out=data["not_out"],
    )

    db.session.add(new_stat)
    db.session.commit()

    return jsonify({"message": "Batting stat added"})
