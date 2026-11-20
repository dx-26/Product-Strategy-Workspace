from pathlib import Path
import sqlite3

DB_PATH = Path(__file__).with_name("portfolio.db")

def connect():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection

def initialize(schema: str, seed_sql: str = ""):
    with connect() as conn:
        conn.executescript(schema)
        if seed_sql and not conn.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='seed_marker'").fetchone():
            conn.executescript(seed_sql)
            conn.execute("CREATE TABLE seed_marker (id INTEGER PRIMARY KEY)")
            conn.execute("INSERT INTO seed_marker(id) VALUES (1)")

def query(sql: str, args=()):
    with connect() as conn:
        return [dict(row) for row in conn.execute(sql, args).fetchall()]

def execute(sql: str, args=()):
    with connect() as conn:
        cursor = conn.execute(sql, args)
        return cursor.lastrowid
