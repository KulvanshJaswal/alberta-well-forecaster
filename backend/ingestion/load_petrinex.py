import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
import zipfile
import io
import shutil
import uuid

import pandas as pd
from datetime import datetime
from dateutil.relativedelta import relativedelta
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import func, text

from app.database import get_db
from app.models.well import Well
from app.models.production import Production


def uwi_to_petrinex(uwi: str) -> str:
    return "ABWI" + "1" + uwi.replace("/", "").replace("-", "") + "0"


def download_petrinex_files():
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "petrinex")
    
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    os.makedirs(output_dir)

    count = 0
    date = datetime.now()

    while True:
        url = f"https://www.petrinex.gov.ab.ca/publicdata/API/Files/AB/Vol/{date.year}-{date.month:02d}/CSV"
        response = requests.get(url)

        if response.ok:
            with zipfile.ZipFile(io.BytesIO(response.content), 'r') as outer_zip:
                inner_zip_name = outer_zip.namelist()[0]
                with outer_zip.open(inner_zip_name) as inner_zip_file:
                    with zipfile.ZipFile(io.BytesIO(inner_zip_file.read())) as inner_zip:
                        csv_name = inner_zip.namelist()[0]
                        inner_zip.extract(csv_name, output_dir)
            count += 1
            if count >= 18:
                break

        date -= relativedelta(months=1)


def ingest_petrinex_files():
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "petrinex")
    db = next(get_db())

    uwi_lookup = {}
    for (uwi,) in db.query(Well.uwi).all():
        uwi_lookup[uwi_to_petrinex(uwi)] = uwi

    print("done with making uwi_lookup")

    for filename in os.listdir(output_dir):
        if not filename.endswith(".CSV"):
            continue

        print(f"Processing {filename}")
        df = pd.read_csv(f"{output_dir}/{filename}", low_memory=False)

        batch = []

        for index, row in df.iterrows():
            petrinex_id = str(row["FromToID"]).strip()
            if petrinex_id not in uwi_lookup:
                continue

            uwi = uwi_lookup[petrinex_id]
            month = datetime.strptime(row["ProductionMonth"], "%Y-%m")
            product = str(row["ProductID"]).strip().lower()

            if product not in ["oil", "gas", "water"]:
                continue

            volume = row["Volume"] if pd.notna(row["Volume"]) else 0.0

            batch.append({
                "uwi": uwi,
                "month": month,
                "oil": volume if product == "oil" else None,
                "gas": volume if product == "gas" else None,
                "water": volume if product == "water" else None,
            })

            if len(batch) == 1000:
                stmt = insert(Production).values(batch)
                stmt = stmt.on_conflict_do_update(
                    index_elements=['uwi', 'month'],
                    set_={
                        'oil': func.coalesce(stmt.excluded.oil, Production.oil),
                        'gas': func.coalesce(stmt.excluded.gas, Production.gas),
                        'water': func.coalesce(stmt.excluded.water, Production.water),
                    }
                )
                db.execute(stmt)
                db.commit()
                batch = []

        if batch:
            stmt = insert(Production).values(batch)
            stmt = stmt.on_conflict_do_update(
                index_elements=['uwi', 'month'],
                set_={
                    'oil': func.coalesce(stmt.excluded.oil, Production.oil),
                    'gas': func.coalesce(stmt.excluded.gas, Production.gas),
                    'water': func.coalesce(stmt.excluded.water, Production.water),
                }
            )
            db.execute(stmt)
            db.commit()

    db.close()
    print("Ingestion complete.")

def find_newest_available_month():
    date = datetime.now()
    attempts = 0
    while attempts < 36:
        url = f"https://www.petrinex.gov.ab.ca/publicdata/API/Files/AB/Vol/{date.year}-{date.month:02d}/CSV"
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            response.close()
            return date
        date -= relativedelta(months=1)
        attempts += 1
    raise Exception("Could not find a valid Petrinex month after 36 attempts - check network connectivity")


def cleanup_old_months():
    db = next(get_db())

    db_max = db.query(func.max(Production.month)).scalar()
    if db_max is None:
        return

    newest_available = find_newest_available_month()

    gap = (newest_available.year - db_max.year) * 12 + (newest_available.month - db_max.month)

    print(f"Gap detected: {gap} month(s). Deleting oldest {gap} month(s) from production.")

    for i in range(gap):
        db.execute(text("DELETE FROM production WHERE month = (SELECT MIN(month) FROM production);"))

    db.commit()
    with db.bind.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
        conn.execute(text("VACUUM FULL production;"))
    db.close()

if __name__ == "__main__":
    cleanup_old_months()
    download_petrinex_files()
    print("Ingesting into database...")
    ingest_petrinex_files()
