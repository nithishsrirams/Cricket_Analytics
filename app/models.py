from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Player(db.Model):
    __tablename__ = "players"
    player_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120))
    nationality = db.Column(db.String(60))
    dob = db.Column(db.Date)
    role = db.Column(db.String(30))


class Team(db.Model):
    __tablename__ = "teams"
    team_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    league = db.Column(db.String(100))
    home_venue_id = db.Column(db.Integer)
    owner = db.Column(db.String(120))
    coach = db.Column(db.String(120))


class Venue(db.Model):
    __tablename__ = "venues"
    venue_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120))
    city = db.Column(db.String(100))
    country = db.Column(db.String(100))
    capacity = db.Column(db.Integer)


class Season(db.Model):
    __tablename__ = "seasons"
    season_id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer)
    league = db.Column(db.String(100))
    playoff_format = db.Column(db.String(100))
    total_teams = db.Column(db.Integer)


class Match(db.Model):
    __tablename__ = "matches"
    match_id = db.Column(db.Integer, primary_key=True)
    season_id = db.Column(db.Integer)
    venue_id = db.Column(db.Integer)
    match_date = db.Column(db.Date)
    format = db.Column(db.String(30))
    home_team_id = db.Column(db.Integer)
    away_team_id = db.Column(db.Integer)
    winner_team_id = db.Column(db.Integer)
    toss_winner_team_id = db.Column(db.Integer)


class Contract(db.Model):
    __tablename__ = "contracts"
    contract_id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer)
    team_id = db.Column(db.Integer)
    season_id = db.Column(db.Integer)
    salary_inr = db.Column(db.BigInteger)
    contract_type = db.Column(db.String(30))


class BattingStat(db.Model):
    __tablename__ = "batting_stats"
    batting_stat_id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer)
    player_id = db.Column(db.Integer)
    runs = db.Column(db.Integer)
    balls_faced = db.Column(db.Integer)
    fours = db.Column(db.Integer)
    sixes = db.Column(db.Integer)
    not_out = db.Column(db.Boolean)
    extras = db.Column(db.Integer)
    overs = db.Column(db.Numeric)


class BowlingStat(db.Model):
    __tablename__ = "bowling_stats"
    bowling_stat_id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer)
    player_id = db.Column(db.Integer)
    overs = db.Column(db.Numeric)
    wickets = db.Column(db.Integer)
    runs_conceded = db.Column(db.Integer)
    extras = db.Column(db.Integer)