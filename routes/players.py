from flask import Blueprint, jsonify, request

from app.models import Player, db

bp = Blueprint("players", __name__)


def _distinct_player_values(column):
    values = db.session.query(column).distinct().all()
    return sorted(
        {value.strip() for (value,) in values if value and value.strip()},
        key=str.lower,
    )


@bp.route("/players", methods=["GET"])
def get_players():
    role = request.args.get("role")

    query = Player.query

    if role:
        query = query.filter_by(role=role)

    players = query.all()

    return jsonify([
        {
            "id": p.player_id,
            "name": p.name,
            "nationality": p.nationality,
            "role": p.role
        } for p in players
    ])


@bp.route("/players/options", methods=["GET"])
def get_player_options():
    return jsonify({
        "nationalities": _distinct_player_values(Player.nationality),
        "roles": _distinct_player_values(Player.role),
    })


@bp.route("/players", methods=["POST"])
def add_player():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    nationality = (data.get("nationality") or "").strip()
    role = (data.get("role") or "").strip()

    if not name or not nationality or not role:
        return jsonify({"message": "Name, nationality, and role are required"}), 400

    new_player = Player(
        name=name,
        nationality=nationality,
        role=role,
    )

    db.session.add(new_player)
    db.session.commit()

    return jsonify({"message": "Player added successfully"})


@bp.route("/players/<int:id>", methods=["GET"])
def get_player(id):
    player = Player.query.get_or_404(id)
    return jsonify({
        "id": player.player_id,
        "name": player.name,
        "nationality": player.nationality,
        "role": player.role
    })


@bp.route("/players/<int:id>", methods=["DELETE"])
def delete_player(id):
    player = Player.query.get_or_404(id)
    db.session.delete(player)
    db.session.commit()

    return jsonify({"message": "Deleted"})
