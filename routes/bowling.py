from decimal import Decimal, InvalidOperation

from flask import Blueprint, jsonify, request

from app.models import BowlingStat, Match, Player, db

bp = Blueprint("bowling", __name__)


def _parse_decimal(value):
    if value in (None, ""):
        raise ValueError("Missing decimal")
    return Decimal(str(value))


def _bowling_payload(data):
    try:
        match_id = int(data.get("match_id"))
        player_id = int(data.get("player_id"))
        overs = _parse_decimal(data.get("overs"))
        wickets = int(data.get("wickets"))
        runs_conceded = int(data.get("runs_conceded"))
        extras = int(data.get("extras"))
    except (TypeError, ValueError, InvalidOperation):
        return None, jsonify({"message": "Match, player, overs, wickets, runs conceded, and extras must be valid"}), 400

    if db.session.get(Match, match_id) is None:
        return None, jsonify({"message": "Selected match does not exist"}), 400

    if db.session.get(Player, player_id) is None:
        return None, jsonify({"message": "Selected player does not exist"}), 400

    if overs < 0 or min(wickets, runs_conceded, extras) < 0:
        return None, jsonify({"message": "Bowling values must be zero or greater"}), 400

    return {
        "match_id": match_id,
        "player_id": player_id,
        "overs": overs,
        "wickets": wickets,
        "runs_conceded": runs_conceded,
        "extras": extras,
    }, None, None


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
    payload, error_response, status_code = _bowling_payload(data)
    if error_response:
        return error_response, status_code

    new_stat = BowlingStat(
        **payload,
    )

    db.session.add(new_stat)
    db.session.commit()

    return jsonify({"message": "Bowling stat added"})


@bp.route("/bowling_stats/<int:id>", methods=["PUT"])
def update_bowling_stat(id):
    stat = BowlingStat.query.get_or_404(id)
    data = request.get_json() or {}
    payload, error_response, status_code = _bowling_payload(data)
    if error_response:
        return error_response, status_code

    stat.match_id = payload["match_id"]
    stat.player_id = payload["player_id"]
    stat.overs = payload["overs"]
    stat.wickets = payload["wickets"]
    stat.runs_conceded = payload["runs_conceded"]
    stat.extras = payload["extras"]

    db.session.commit()

    return jsonify({"message": "Bowling stat updated"})


@bp.route("/bowling_stats/<int:id>", methods=["DELETE"])
def delete_bowling_stat(id):
    stat = BowlingStat.query.get_or_404(id)
    db.session.delete(stat)
    db.session.commit()

    return jsonify({"message": "Bowling stat deleted"})
