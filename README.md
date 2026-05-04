# 🏏 IPL Cricket Analytics

A full-stack analytics platform for the Indian Premier League — backed by a normalized MySQL database, a Flask REST API, and a React + TypeScript dashboard.

> **Database Systems — Spring 2026**
> Nithish Sriram Srinivasan · Tarun Malepati · Aditya Hiraman Gaidhani

---

## 📑 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Backend](#backend-setup)
  - [Frontend](#frontend-setup)
- [Analytics Queries](#analytics-queries)
- [Dataset](#dataset)
- [Team](#team)

---

## Overview

`ipl_cricket_analytics` is a relational database system built on **MySQL 8+** that organizes and analyzes 12 seasons of IPL data (2008–2019). It covers real player, team, venue, match, contract, and performance statistics sourced from [Cricsheet](https://cricsheet.org/) and [Kaggle](https://www.kaggle.com/).

**Key numbers at a glance:**

| Entity | Count |
|---|---|
| Seasons | 12 (2008–2019) |
| Teams | 10 |
| Venues | 11 |
| Players | 75 |
| Matches | 63 |
| Contracts | 141 |
| Batting records | 300 |
| Bowling records | 183 |

The schema is normalized to **Third Normal Form (3NF)** across 8 interconnected tables with comprehensive constraint enforcement, triggers, and support for analytical window-function queries.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Database | MySQL 8+ |
| Backend | Python · Flask 3.1 · SQLAlchemy 2.0 |
| DB Driver | PyMySQL |
| Frontend | React · TypeScript · Vite · Tailwind CSS |
| API Style | RESTful JSON |

---

## Database Schema

Eight tables linked by foreign keys, created in dependency order:

```
seasons → matches, contracts
venues  → matches, teams
teams   → matches (home / away / winner)
players → contracts, batting_stats, bowling_stats
matches → batting_stats, bowling_stats
```

### Tables

| Table | Rows | Key Columns |
|---|---|---|
| `seasons` | 12 | `season_id`, `year`, `league`, `playoff_format`, `total_teams` |
| `venues` | 11 | `venue_id`, `name`, `city`, `country`, `capacity` |
| `teams` | 10 | `team_id`, `name`, `league`, `home_venue_id`, `owner`, `coach` |
| `players` | 75 | `player_id`, `name`, `nationality`, `dob`, `role`, `batting_style`, `bowling_style` |
| `matches` | 63 | `match_id`, `season_id`, `venue_id`, `home_team_id`, `away_team_id`, `winner_team_id` |
| `contracts` | 141 | `contract_id`, `player_id`, `team_id`, `season_id`, `salary_inr`, `contract_type` |
| `batting_stats` | 300 | `batting_stat_id`, `match_id`, `player_id`, `runs`, `balls_faced`, `fours`, `sixes`, `not_out` |
| `bowling_stats` | 183 | `bowling_stat_id`, `match_id`, `player_id`, `overs`, `wickets`, `runs_conceded`, `extras` |

### Constraint Highlights

- `players.role` — constrained to `Batter | Bowler | All-rounder | Wicketkeeper`
- `matches.format` — constrained to `T20 | IPL`
- `contracts.contract_type` — constrained to `auction | retention | traded | overseas`
- `seasons.year` — `UNIQUE` to prevent duplicate season entries
- `venues.name` — `UNIQUE` to prevent duplicate stadium entries
- All numeric performance columns have non-negativity `CHECK` constraints

### Triggers

Two `BEFORE INSERT / BEFORE UPDATE` triggers on `matches` enforce the business rule that a team cannot play against itself — a constraint MySQL cannot express as a standard `CHECK` across two columns of the same row:

```sql
CREATE TRIGGER trg_matches_home_away_insert
BEFORE INSERT ON matches FOR EACH ROW
BEGIN
  IF NEW.home_team_id = NEW.away_team_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'home_team_id and away_team_id cannot be the same';
  END IF;
END;
```

---

## API Endpoints

All endpoints return JSON. Base URL: `http://localhost:5000`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/seasons` | List all seasons |
| GET | `/venues` | List all venues |
| GET | `/teams` | List all teams |
| GET | `/players` | List all players |
| GET | `/matches` | List all matches |
| GET | `/contracts` | List all contracts |
| GET | `/batting` | List all batting stats |
| GET | `/bowling` | List all bowling stats |
| GET | `/analytics/top-batsmen` | Top batsmen by value index (CTE + window functions) |
| GET | `/analytics/top-bowlers` | Top 5 wicket-takers across all matches |
| GET | `/analytics/team-wins` | Win counts per team |
| GET | `/analytics/avg-runs` | Average runs per player |
| GET | `/analytics/value-players` | Salary vs performance efficiency (scatter data) |

---

## Project Structure

```
Cricket_Analytics/
├── run.py                  # App entry point — flask run
├── requirements.txt        # Python dependencies
├── .gitignore
│
├── app/
│   ├── __init__.py         # Flask app factory + DB init
│   ├── config.py           # DB connection config
│   └── models.py           # SQLAlchemy models
│
├── routes/
│   ├── seasons.py
│   ├── venues.py
│   ├── teams.py
│   ├── players.py
│   ├── matches.py
│   ├── contracts.py
│   ├── batting.py
│   ├── bowling.py
│   ├── analytics.py        # Aggregation & window-function queries
│   └── test.py
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── App.tsx
        ├── lib/
        │   └── api.ts      # Typed API client
        ├── components/
        │   └── ResourceTablePage.tsx
        └── views/
            ├── AnalyticsView.tsx
            ├── BattingStatsView.tsx
            ├── BowlingStatsView.tsx
            ├── ContractsView.tsx
            ├── MatchesView.tsx
            ├── PlayersView.tsx
            ├── SeasonsView.tsx
            ├── TeamsView.tsx
            └── VenuesView.tsx
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- MySQL 8+
- Node.js 18+ and npm

### Backend Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/nithishsrirams/Cricket_Analytics.git
   cd Cricket_Analytics
   ```

2. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate        # Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure the database connection**

   Edit `app/config.py` and set your MySQL credentials:
   ```python
   SQLALCHEMY_DATABASE_URI = "mysql+pymysql://<user>:<password>@localhost/ipl_cricket_analytics"
   ```

5. **Create the database and seed data**

   Run the provided DDL and INSERT scripts in MySQL Workbench or the CLI:
   ```bash
   mysql -u root -p < schema.sql
   mysql -u root -p ipl_cricket_analytics < seed.sql
   ```

6. **Start the backend**
   ```bash
   python run.py
   ```
   The API will be available at `http://localhost:5000`.

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The dashboard will be available at `http://localhost:5173`.

---

## Analytics Queries

Five analytical queries are exposed through the `/analytics` routes:

| Query | SQL Pattern | Purpose |
|---|---|---|
| Top Batsmen by Value Index | `WITH` CTEs + `ROW_NUMBER() OVER (…)` | Ranks batters by a composite cost-efficiency score |
| Player + Team + Salary | 3-table `JOIN` | Full contract summary across all players |
| Total Runs per Player | `SUM(runs) GROUP BY player_id` | Aggregated batting totals |
| Best Bowlers by Wickets | `SUM(wickets) ORDER BY DESC LIMIT 5` | Top 5 wicket-takers |
| Matches Played per Team | `UNION ALL` home + away + `GROUP BY` | Total appearances per franchise |

The **Value Index** is computed as:

```
value_index = (runs + (fours * 0.5) + (sixes * 1.5) + (not_out_bonus)) / (salary_in_crore)
```

This surfaces the most cost-efficient batters — AM Nayar led the 2008–2019 dataset with a value index of **130.00 per crore**.

---

## Dataset

Data was sourced and cleaned from:

- [Cricsheet](https://cricsheet.org/) — ball-by-ball IPL data (primary performance source)
- [Kaggle IPL Dataset](https://www.kaggle.com/) — match results, auction data, player stats
- Manual curation for team ownership, coaching staff, and venue details

Cleaned CSV files included with the project:

```
players_clean.csv   (75 rows)     batting_clean.csv   (300 rows)
teams_clean.csv     (10 rows)     bowling_clean.csv   (183 rows)
venues_clean.csv    (11 rows)     contracts_clean.csv (141 rows)
seasons_clean.csv   (12 rows)     matches_clean.csv   (63 rows)
```

All foreign key references were cross-validated post-expansion to ensure referential integrity.

---

## Team

| Contributor | Role |
|---|---|
| **Nithish Sriram Srinivasan** | Database schema (3NF), DDL, CRUD, triggers, analytical queries, Flask REST API |
| **Tarun Malepati** | Data sourcing, cleaning & expansion, FK integrity validation, seed scripts, report |
| **Aditya Hiraman Gaidhani** | Application design, frontend dashboard (React + TypeScript), visualization layer |

---

## References

- [Cricsheet IPL Data](https://cricsheet.org/)
- [Kaggle IPL Dataset](https://www.kaggle.com/)
- [MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Vite](https://vitejs.dev/) · [Tailwind CSS](https://tailwindcss.com/)
