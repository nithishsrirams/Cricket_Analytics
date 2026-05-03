from decimal import Decimal, InvalidOperation

from flask import Blueprint, jsonify, request

from app.models import BowlingStat, Match, Player, db

bp = Blueprint("bowling", __name__)


def _parse_decimal(value):
    if value in (None, ""):
        raise ValueError("Missing decimal")
    return Decimal(str(value))

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
    data = request.get_json() or {}

    try:
        match_id = int(data.get("match_id"))
        player_id = int(data.get("player_id"))
        overs = _parse_decimal(data.get("overs"))
        wickets = int(data.get("wickets"))
        runs_conceded = int(data.get("runs_conceded"))
        extras = int(data.get("extras"))
    except (TypeError, ValueError, InvalidOperation):
        return jsonify({"message": "Match, player, overs, wickets, runs conceded, and extras must be valid"}), 400

    if db.session.get(Match, match_id) is None:
        return jsonify({"message": "Selected match does not exist"}), 400

    if db.session.get(Player, player_id) is None:
        return jsonify({"message": "Selected player does not exist"}), 400

    if overs < 0 or min(wickets, runs_conceded, extras) < 0:
        return jsonify({"message": "Bowling values must be zero or greater"}), 400

    new_stat = BowlingStat(
        match_id=match_id,
        player_id=player_id,
        overs=overs,
        wickets=wickets,
        runs_conceded=runs_conceded,
        extras=extras,
    )

    db.session.add(new_stat)
    db.session.commit()

    return jsonify({"message": "Bowling stat added"})
