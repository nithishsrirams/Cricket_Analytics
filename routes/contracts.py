from flask import Blueprint, jsonify, request

from app.models import Contract, Player, Season, Team, db

bp = Blueprint("contracts", __name__)


def _missing_record(model, record_id):
    return record_id is None or db.session.get(model, record_id) is None


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

    try:
        player_id = int(data.get("player_id"))
        team_id = int(data.get("team_id"))
        season_id = int(data.get("season_id"))
        salary_inr = int(data.get("salary_inr"))
    except (TypeError, ValueError):
        return jsonify({"message": "Player, team, season, and salary must be valid"}), 400

    contract_type = (data.get("contract_type") or "").strip()

    if not contract_type:
        return jsonify({"message": "Contract type is required"}), 400

    if salary_inr < 0:
        return jsonify({"message": "Salary must be zero or greater"}), 400

    if _missing_record(Player, player_id):
        return jsonify({"message": "Selected player does not exist"}), 400

    if _missing_record(Team, team_id):
        return jsonify({"message": "Selected team does not exist"}), 400

    if _missing_record(Season, season_id):
        return jsonify({"message": "Selected season does not exist"}), 400

    new_contract = Contract(
        player_id=player_id,
        team_id=team_id,
        season_id=season_id,
        salary_inr=salary_inr,
        contract_type=contract_type,
    )

    db.session.add(new_contract)
    db.session.commit()

    return jsonify({"message": "Contract added"})
