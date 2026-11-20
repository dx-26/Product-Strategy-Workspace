# Product Strategy Workspace

> Ideas, RICE prioritization, user stories, and release planning

## Product problem

Associate product managers, product owners, and cross-functional teams making transparent roadmap tradeoffs.

## MVP features

Score product opportunities using RICE, maintain a product backlog with user stories, track release milestones, and review target metrics.

This is a **working, local-first portfolio MVP** using **Python, Streamlit, pandas, and SQLite**. It includes preloaded fictional demo records, interactive forms, data tables and/or charts, CSV export, unit tests, and CI.

## Quick start

Requires Python 3.10 or newer (CI tests Python 3.12).

```bash
python -m venv .venv
# Windows PowerShell: .venv\\\\Scripts\\\\Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements.txt
streamlit run app.py
```

## Test

```bash
python -m pytest -q
```

## Product management perspective

**Users:** Associate product managers, product owners, and cross-functional teams making transparent roadmap tradeoffs.

**Metrics to track:** Time from idea to decision; release predictability; % roadmap items tied to customer evidence; feature adoption.

**Next iterations:** Add Jira/GitHub synchronization; customer interview evidence; roadmap dependencies; collaboration and AI-assisted draft stories.

## Key tradeoffs

* SQLite and a local web UI prioritize easy setup over multi-user scalability.
* Sample data and rules are illustrative; validate in real contexts before decisions.
* The MVP deliberately avoids personal data collection and external integrations.
* See `docs/architecture.md` and `SECURITY.md` for production hardening notes.

## Repository contents

* `app.py`: Streamlit UI and feature workflows
* `domain.py`: testable scoring or analytical rules
* `storage.py`: SQLite helpers and example records
* `tests/`: unit tests
* `.github/workflows/ci.yml`: GitHub Actions checks
* `docs/product-requirements.md`: outcomes and acceptance criteria
* `docs/roadmap.md`: delivery phases and risks

