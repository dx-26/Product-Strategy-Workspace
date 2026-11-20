# Architecture

- `app.py`: interactive Streamlit user interface, input validation, and charts.
- `storage.py`: local SQLite persistence, schema and seed records.
- `domain.py`: deterministic domain functions designed to be unit tested.
- `tests/`: tests for decision logic and edge cases.
- Data flow: user input → validated form → SQLite → domain calculations → tables/charts/download.
- SQLite file is created on first run and excluded from Git.

## Deployment caution

Local SQLite is fine for a personal demo but ephemeral or unsafe under many multi-user cloud deployments. Before production deployment, use a managed database and access controls.
