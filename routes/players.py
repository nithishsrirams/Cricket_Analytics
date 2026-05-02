from flask import Blueprint, jsonify, request

from app.models import Player, db

bp = Blueprint("players", __name__)

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
            "role": p.role
        } for p in players
    ])


@bp.route("/players", methods=["POST"])
def add_player():
    data = request.json

    new_player = Player(
        name=data["name"],
        nationality=data["nationality"],
        role=data["role"],
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
        "role": player.role
    })


@bp.route("/players/<int:id>", methods=["DELETE"])
def delete_player(id):
    player = Player.query.get_or_404(id)
    db.session.delete(player)
    db.session.commit()

    return jsonify({"message": "Deleted"})
