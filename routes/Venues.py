from flask import Blueprint, jsonify, request

from app.models import Venue, db

bp = Blueprint("venues", __name__)


def _venue_payload(data):
    name = (data.get("name") or "").strip()
    city = (data.get("city") or "").strip()
    country = (data.get("country") or "").strip()

    try:
        capacity = int(data.get("capacity"))
    except (TypeError, ValueError):
        return None, jsonify({"message": "Capacity must be valid"}), 400

    if not name or not city or not country:
        return None, jsonify({"message": "Venue name, city, and country are required"}), 400

    if capacity < 0:
        return None, jsonify({"message": "Capacity must be zero or greater"}), 400

    return {
        "name": name,
        "city": city,
        "country": country,
        "capacity": capacity,
    }, None, None


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
    data = request.get_json() or {}
    payload, error_response, status_code = _venue_payload(data)
    if error_response:
        return error_response, status_code

    new_venue = Venue(
        **payload,
    )

    db.session.add(new_venue)
    db.session.commit()

    return jsonify({"message": "Venue added"})


@bp.route("/venues/<int:id>", methods=["PUT"])
def update_venue(id):
    venue = Venue.query.get_or_404(id)
    data = request.get_json() or {}
    payload, error_response, status_code = _venue_payload(data)
    if error_response:
        return error_response, status_code

    venue.name = payload["name"]
    venue.city = payload["city"]
    venue.country = payload["country"]
    venue.capacity = payload["capacity"]

    db.session.commit()

    return jsonify({"message": "Venue updated"})


@bp.route("/venues/<int:id>", methods=["DELETE"])
def delete_venue(id):
    venue = Venue.query.get_or_404(id)
    db.session.delete(venue)
    db.session.commit()

    return jsonify({"message": "Venue deleted"})
