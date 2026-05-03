from flask import Blueprint, jsonify, request

from app.models import Contract, Player, Season, Team, db

bp = Blueprint("contracts", __name__)


def _missing_record(model, record_id):
    return record_id is None or db.session.get(model, record_id) is None


def _contract_payload(data):
    try:
        player_id = int(data.get("player_id"))
        team_id = int(data.get("team_id"))
        season_id = int(data.get("season_id"))
        salary_inr = int(data.get("salary_inr"))
    except (TypeError, ValueError):
        return None, jsonify({"message": "Player, team, season, and salary must be valid"}), 400

    contract_type = (data.get("contract_type") or "").strip()

    if not contract_type:
        return None, jsonify({"message": "Contract type is required"}), 400

    if salary_inr < 0:
        return None, jsonify({"message": "Salary must be zero or greater"}), 400

    if _missing_record(Player, player_id):
        return None, jsonify({"message": "Selected player does not exist"}), 400

    if _missing_record(Team, team_id):
        return None, jsonify({"message": "Selected team does not exist"}), 400

    if _missing_record(Season, season_id):
        return None, jsonify({"message": "Selected season does not exist"}), 400

    return {
        "player_id": player_id,
        "team_id": team_id,
        "season_id": season_id,
        "salary_inr": salary_inr,
        "contract_type": contract_type,
    }, None, None


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
    data = request.get_json() or {}
    payload, error_response, status_code = _contract_payload(data)
    if error_response:
        return error_response, status_code

    new_contract = Contract(
        **payload,
    )

    db.session.add(new_contract)
    db.session.commit()

    return jsonify({"message": "Contract added"})


@bp.route("/contracts/<int:id>", methods=["PUT"])
def update_contract(id):
    contract = Contract.query.get_or_404(id)
    data = request.get_json() or {}
    payload, error_response, status_code = _contract_payload(data)
    if error_response:
        return error_response, status_code

    contract.player_id = payload["player_id"]
    contract.team_id = payload["team_id"]
    contract.season_id = payload["season_id"]
    contract.salary_inr = payload["salary_inr"]
    contract.contract_type = payload["contract_type"]

    db.session.commit()

    return jsonify({"message": "Contract updated"})


@bp.route("/contracts/<int:id>", methods=["DELETE"])
def delete_contract(id):
    contract = Contract.query.get_or_404(id)
    db.session.delete(contract)
    db.session.commit()

    return jsonify({"message": "Contract deleted"})
