from flask import Blueprint, jsonify, request

from app.models import Venue, db

bp = Blueprint("venues", __name__)


@bp.route("/venues", methods=["GET"])
def get_venues():
    venues = Venue.query.all()
    return jsonify(
        [
            {
                "id": v.venue_id,
                "name": v.name,
                "city": v.city,
                "country": v.country,
                "capacity": v.capacity,
            }
            for v in venues
        ]
    )


@bp.route("/venues", methods=["POST"])
def add_venue():
    data = request.json

    new_venue = Venue(
        name=data["name"],
        city=data["city"],
        country=data["country"],
        capacity=data["capacity"],
    )

    db.session.add(new_venue)
    db.session.commit()

    return jsonify({"message": "Venue added"})
