from flask import Blueprint, jsonify, request

from app.models import BattingStat, Match, Player, db

bp = Blueprint("batting", __name__)


def _parse_bool(value):
    if isinstance(value, bool):
        return value

    if isinstance(value, str):
        normalized_value = value.strip().lower()
        if normalized_value in {"true", "yes", "1"}:
            return True
        if normalized_value in {"false", "no", "0"}:
            return False

    raise ValueError("Invalid boolean")


def _batting_payload(data):
    try:
        match_id = int(data.get("match_id"))
        player_id = int(data.get("player_id"))
        runs = int(data.get("runs"))
        balls_faced = int(data.get("balls_faced"))
        fours = int(data.get("fours"))
        sixes = int(data.get("sixes"))
        not_out = _parse_bool(data.get("not_out"))
    except (TypeError, ValueError):
        return None, jsonify({"message": "Match, player, scores, and not out must be valid"}), 400

    if db.session.get(Match, match_id) is None:
        return None, jsonify({"message": "Selected match does not exist"}), 400

    if db.session.get(Player, player_id) is None:
        return None, jsonify({"message": "Selected player does not exist"}), 400

    if min(runs, balls_faced, fours, sixes) < 0:
        return None, jsonify({"message": "Batting values must be zero or greater"}), 400

    return {
        "match_id": match_id,
        "player_id": player_id,
        "runs": runs,
        "balls_faced": balls_faced,
        "fours": fours,
        "sixes": sixes,
        "not_out": not_out,
    }, None, None


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
    data = request.get_json() or {}
    payload, error_response, status_code = _batting_payload(data)
    if error_response:
        return error_response, status_code

    new_stat = BattingStat(
        **payload,
    )

    db.session.add(new_stat)
    db.session.commit()

    return jsonify({"message": "Batting stat added"})


@bp.route("/batting_stats/<int:id>", methods=["PUT"])
def update_batting_stat(id):
    stat = BattingStat.query.get_or_404(id)
    data = request.get_json() or {}
    payload, error_response, status_code = _batting_payload(data)
    if error_response:
        return error_response, status_code

    stat.match_id = payload["match_id"]
    stat.player_id = payload["player_id"]
    stat.runs = payload["runs"]
    stat.balls_faced = payload["balls_faced"]
    stat.fours = payload["fours"]
    stat.sixes = payload["sixes"]
    stat.not_out = payload["not_out"]

    db.session.commit()

    return jsonify({"message": "Batting stat updated"})


@bp.route("/batting_stats/<int:id>", methods=["DELETE"])
def delete_batting_stat(id):
    stat = BattingStat.query.get_or_404(id)
    db.session.delete(stat)
    db.session.commit()

    return jsonify({"message": "Batting stat deleted"})
