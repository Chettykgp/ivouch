# Ward Boundary Data Sources

## Source priority

| Priority | Source | Type | Notes |
|---|---|---|---|
| 1 | Municipal Demarcation Board (MDB) ArcGIS | REST API | Official SA ward boundaries. Preferred. |
| 2 | open.africa JHB Ward Shapefile | Shapefile | Practical fallback. Sourced from MDB. |
| 3 | City of Johannesburg Ward Map Books | PDF | For validation only. Not machine-readable. |

### MDB ArcGIS Open Data Portal

The Municipal Demarcation Board publishes ward boundaries via ArcGIS REST services at:

```
https://services6.arcgis.com/VBRh56lBQJSUxMBm/arcgis/rest/services/
```

The `fetch-jhb-wards.ts` script attempts several candidate layer paths automatically. If all fail (the MDB portal is intermittently unreliable), you must download manually.

**Manual download steps:**

1. Open: https://services6.arcgis.com/VBRh56lBQJSUxMBm/arcgis/rest/services/
2. Find a FeatureServer with "Ward" in the name
3. Open layer 0 → click "Query" tab
4. Set `Where` = `MUNIC_NAME='City of Johannesburg'`
5. Format = GeoJSON → Get Features
6. Save the response to `data/raw/wards/jhb-wards-raw.geojson`

### open.africa Shapefile

1. Open: https://open.africa/dataset/johannesburg-metropolitan-municipality-wards
2. Download the .zip file
3. Extract to a temp directory
4. Convert to GeoJSON + reproject to WGS84 (EPSG:4326):

```bash
ogr2ogr -f GeoJSON -t_srs EPSG:4326 data/raw/wards/jhb-wards-raw.geojson JHB_Wards.shp
```

## How Ward 23 suburbs were curated

The suburbs assigned to Ward 23 (Glenvista, Bassonia, Mulbarton, Glenanda, Liefde en Vrede, Mayfield Park, Rispark, South View) were sourced from:

- **SPWard list (May 2026)** — a manually assembled suburb-per-ward reference compiled from ward councillor reports, local ward committee meeting records, and the City of Johannesburg ward map books.
- Cross-referenced with Google Maps suburb boundaries and Lightstone property suburb data.

Ward boundaries and suburb names do not always align perfectly. The following caveats apply:

- Some suburbs straddle ward boundaries. Where this occurs, the suburb is assigned to the ward that contains the majority of residential erfs.
- Estate names (e.g., security villages within Glenvista) are tracked in `community_aliases` with `alias_type = 'estate'`.
- The suburb "Liefde en Vrede" is an informal name not recognised in all datasets — it is tracked as `confidence = 'manual'`.

## Running the import scripts

```bash
# 1. Attempt API fetch (falls back to manual instructions if unavailable)
npm run geo:fetch

# 2. Normalise and filter to JHB wards
npm run geo:convert

# 3. Upsert into Supabase (requires SUPABASE_SERVICE_ROLE_KEY)
npm run geo:import

# 4. Seed Ward 23 with known suburbs and aliases
npm run geo:seed-ward-23

# 5. Verify the import
npm run geo:verify
```

## Manually refreshing data

Ward boundaries change after each general election (typically every 5 years). The next expected change is 2026–2027.

To refresh:

1. Re-run `geo:fetch` to get the latest MDB data
2. Re-run `geo:convert` and `geo:import`
3. Manually review child suburbs and aliases for any ward that has changed boundary
4. Update `source_date` in the community record and `boundary_version` in `community_boundaries`

## Known limitations

- The MDB ArcGIS portal is not reliably available. Cache the raw GeoJSON after a successful fetch.
- PDF ward map books (CoJ) use inconsistent suburb naming compared to Stats SA and Lightstone.
- No PostGIS geometry column is currently in use — GeoJSON is stored as `jsonb` in `community_boundaries`. Point-in-polygon queries require PostGIS and the `geom` column (future work).
- Boundary version dates are approximate (set to the fetch date, not the MDB publication date).
