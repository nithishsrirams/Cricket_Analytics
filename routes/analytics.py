from flask import Blueprint, jsonify
from sqlalchemy import func

from app.models import BattingStat, BowlingStat, Contract, Match, Player, Team, db

bp = Blueprint("analytics", __name__)


@bp.route("/analytics/top_batsmen", methods=["GET"])
def top_batsmen():
    strike_rate = (func.sum(BattingStat.runs) / func.sum(BattingStat.balls_faced) * 100).label("strike_rate")
    result = (
        db.session.query(
            Player.name,
            func.sum(BattingStat.runs).label("runs"),
            func.sum(BattingStat.balls_faced).label("balls"),
            strike_rate,
        )
        .join(BattingStat, Player.player_id == BattingStat.player_id)
        .group_by(Player.player_id)
        .order_by(strike_rate.desc())
        .limit(5)
        .all()
    )
    return jsonify([dict(r._mapping) for r in result])


@bp.route("/analytics/top_bowlers", methods=["GET"])
def top_bowlers():
    result = (
        db.session.query(
            Player.name,
            func.sum(BowlingStat.wickets).label("wickets"),
        )
        .join(BowlingStat, Player.player_id == BowlingStat.player_id)
        .group_by(Player.player_id)
        .order_by(func.sum(BowlingStat.wickets).desc())
        .limit(5)
        .all()
    )
    return jsonify([dict(r._mapping) for r in result])


@bp.route("/analytics/value_players", methods=["GET"])
def value_players():
    result = (
        db.session.query(
            Player.name,
            func.sum(BattingStat.runs).label("runs"),
            func.sum(BattingStat.fours).label("fours"),
            func.sum(BattingStat.sixes).label("sixes"),
            func.sum(BattingStat.not_out).label("not_outs"),
            func.sum(Contract.salary_inr).label("salary"),
            (
                (
                    func.sum(BattingStat.runs)
                    + 2 * func.sum(BattingStat.fours)
                    + 3 * func.sum(BattingStat.sixes)
                    + 5 * func.sum(BattingStat.not_out)
                )
                / func.sum(Contract.salary_inr)
            ).label("value_index"),
        )
        .join(BattingStat, Player.player_id == BattingStat.player_id)
        .join(Contract, Player.player_id == Contract.player_id)
        .group_by(Player.player_id)
        .order_by(
            (
                (
                    func.sum(BattingStat.runs)
                    + 2 * func.sum(BattingStat.fours)
                    + 3 * func.sum(BattingStat.sixes)
                    + 5 * func.sum(BattingStat.not_out)
                )
                / func.sum(Contract.salary_inr)
            ).desc()
        )
        .limit(5)
        .all()
    )

    return jsonify([dict(r._mapping) for r in result])


@bp.route("/analytics/team_wins")
def team_wins():
    result = (
        db.session.query(
            Team.name,
            func.count(Match.match_id).label("wins"),
        )
        .join(Match, Team.team_id == Match.winner_team_id)
        .group_by(Team.team_id)
        .order_by(func.count(Match.match_id).desc())
        .all()
    )

    return jsonify([dict(r._mapping) for r in result])


@bp.route("/analytics/avg_runs")
def avg_runs():
    result = (
        db.session.query(
            Player.name,
            func.avg(BattingStat.runs).label("avg_runs"),
        )
        .join(BattingStat, Player.player_id == BattingStat.player_id)
        .group_by(Player.player_id)
        .order_by(func.avg(BattingStat.runs).desc())
        .all()
    )

    return jsonify([dict(r._mapping) for r in result])
