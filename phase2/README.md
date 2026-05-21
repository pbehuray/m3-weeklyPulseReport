# Phase 2: Review Data Collection

## Objective

Load public App Store and Play Store review exports, validate required fields, filter by the 8–12 week date window, remove incomplete and duplicate entries, and produce a clean ingested dataset for Phase 3.

## Contents

```text
phase2/
├── ingest_reviews.py              # Main ingestion script
├── README.md                      # This file
└── data/
    ├── raw/                       # Source review export files
    │   ├── app_store_reviews.csv  # Sample App Store reviews
    │   └── play_store_reviews.csv # Sample Play Store reviews
    └── ingested/                  # Output (created after running ingestion)
        ├── ingested_reviews.json  # Clean ingested reviews
        └── ingestion_report.json  # Ingestion summary and statistics
```

## How to Run

```bash
python phase2/ingest_reviews.py
```

## What the Ingestion Script Does

1. **Discovers review files** — finds all `.csv` and `.json` files in `data/raw/`
2. **Loads reviews** — reads each file and collects all review records
3. **Validates required fields** — checks `review_text`, `rating`, `date`, `platform`
4. **Filters by date window** — keeps only reviews from the last 12 weeks
5. **Removes duplicates** — deduplicates by review text + date + platform
6. **Saves output** — writes `ingested_reviews.json` and `ingestion_report.json`

## Sample Data

The `data/raw/` folder contains sample review CSVs with:

- **16 App Store reviews** (includes 1 empty text, 1 old review to test filtering)
- **16 Play Store reviews** (includes 1 empty/missing rating, 1 old review to test filtering)

## Validation Rules (from Phase 1 schema)

- `review_text` must be non-empty
- `date` must be parseable
- `rating` must be an integer between 1 and 5
- `platform` must be `app_store` or `play_store`
- Reviews outside the 12-week window are excluded
- Duplicate entries are removed

## Status

Complete — ingestion script implemented with sample data and validation.
