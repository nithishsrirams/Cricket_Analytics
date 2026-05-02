from flask import Blueprint, jsonify, request

from app.models import Contract, db

bp = Blueprint("contracts", __name__)

@bp.route("/contracts", methods=["GET"])
def get_contracts():
    contracts = Contract.query.all()
    return jsonify([
        {
            "id": c.contract_id,
            "player_id": c.player_id,
            "team_id": c.team_id,
            "season_id": c.season_id,
            "salary": c.salary_inr,
            "type": c.contract_type
        } for c in contracts
    ])


@bp.route("/contracts", methods=["POST"])
def add_contract():
    data = request.json

    new_contract = Contract(
        player_id=data["player_id"],
        team_id=data["team_id"],
        season_id=data["season_id"],
        salary_inr=data["salary_inr"],
        contract_type=data["contract_type"],
    )

    db.session.add(new_contract)
    db.session.commit()

    return jsonify({"message": "Contract added"})