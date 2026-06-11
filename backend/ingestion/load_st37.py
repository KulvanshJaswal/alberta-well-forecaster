import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import geopandas as gpd
import pandas as pd
from sqlalchemy.dialects.postgresql import insert
from app.database import get_db
from app.models.well import Well
import requests
import zipfile
import io

output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "ST37_SH")

def upsert_well(db, well_data):
    stmt = insert(Well).values(**well_data)
    stmt = stmt.on_conflict_do_update(
        index_elements=['uwi'],
        set_={
            'licensee': stmt.excluded.licensee,
            'status': stmt.excluded.status,
            'latitude': stmt.excluded.latitude,
            'longitude': stmt.excluded.longitude
        }
    )
    db.execute(stmt)

def download_files():
    os.makedirs(output_dir, exist_ok=True)

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    # Shapefile
    response = requests.get("https://www.aer.ca/documents/sts/st37/SurfaceHolesShapefile.zip", headers=headers)
    print(f"Shapefile download status: {response.status_code}")
    if response.ok:
        with zipfile.ZipFile(io.BytesIO(response.content), "r") as zip_file:
            for name in zip_file.namelist():
                filename = os.path.basename(name)
                if not filename:
                    continue
                data = zip_file.read(name)
                with open(os.path.join(output_dir, filename), "wb") as f:
                    f.write(data)
        print("Shapefile extracted successfully")
    else:
        print(f"Shapefile download failed: {response.status_code}")

    # WellList
    response = requests.get("https://www.aer.ca/documents/sts/st37/ST37.zip", headers=headers)
    print(f"WellList download status: {response.status_code}")
    if response.ok:
        with zipfile.ZipFile(io.BytesIO(response.content), "r") as zip_file:
            for name in zip_file.namelist():
                if "WellList" in name and not name.endswith("/"):
                    data = zip_file.read(name)
                    with open(os.path.join(output_dir, "WellList.txt"), "wb") as f:
                        f.write(data)
                    print("WellList.txt extracted successfully")
                    break
    else:
        print(f"WellList download failed: {response.status_code}")

download_files()

gdf = gpd.read_file(f"{output_dir}/ST37_SH_GCS_NAD83.shp")
gdf['Licence'] = gdf['Licence'].str.strip()

txt_df = pd.read_csv(f"{output_dir}/WellList.txt", sep="\t", header=None)
txt_df[8] = txt_df[8].str.strip()
txt_df[19] = txt_df[19].str.strip()

merged = gdf.merge(txt_df, left_on='Licence', right_on=8)
merged = merged.drop_duplicates(subset=[0])
merged = merged[[0, "CompName", "Latitude", "Longitude", 19]]
merged = merged.rename(columns={
    0: "uwi",
    "CompName": "licensee",
    "Latitude": "latitude",
    "Longitude": "longitude",
    19: "status"
})

db = next(get_db())

for index, row in merged.iterrows():
    well_data = {
        "uwi": row["uwi"],
        "licensee": row["licensee"],
        "latitude": row["latitude"],
        "longitude": row["longitude"],
        "status": row["status"]
    }
    upsert_well(db, well_data)

db.commit()