# Community Model Architecture

## Overview

iVouch uses a hierarchical community model to organise businesses, vouches, and users by geographic area. The model supports South African municipal ward structure while remaining flexible enough to represent suburbs, regions, and informal groupings.

## Community types

| Type | Example | Notes |
|---|---|---|
| `ward` | Johannesburg Ward 23 | Official municipal ward. Contains child suburbs. |
| `suburb` | Glenvista | Residential suburb. Has a parent ward. |
| `region` | Johannesburg South | Grouping of multiple wards. |
| `city` | Johannesburg | Top-level municipality area. |
| `custom` | Cape Winelands Route | Free-form grouping for campaigns or promotions. |

## Parent/child hierarchy

```
city (Johannesburg)
  └── region (Johannesburg South)
        └── ward (Ward 23)
              ├── suburb (Glenvista)
              ├── suburb (Bassonia)
              └── suburb (Mulbarton)
```

The `parent_community_id` column on `communities` implements this hierarchy. There is no enforced depth limit, but in practice the hierarchy is 2–3 levels deep.

## Alias system

Each community can have multiple aliases via the `community_aliases` table. Aliases allow the platform to answer searches by common suburb names, township names, estate names, and informal labels, even when the canonical community record uses an official name.

### Alias types

| Type | Example | Use case |
|---|---|---|
| `suburb` | Glenvista | Common suburb name for a ward |
| `township` | Soweto | Township that spans multiple wards |
| `estate` | Woodhill Estate | Security estate within a suburb |
| `neighbourhood` | Observatory | Informal neighbourhood name |
| `common_name` | Joburg CBD | Common abbreviation or colloquial name |
| `ward_label` | Ward 23 | Numeric ward label for direct search |
| `region_label` | Region D | CoJ administrative region label |

### Confidence levels

| Level | Meaning |
|---|---|
| `official` | Published by a government body (MDB, Stats SA) |
| `imported` | Imported from a third-party dataset (open.africa, Lightstone) |
| `manual` | Added by a human based on local knowledge |
| `inferred` | Derived algorithmically (e.g., centroid-based suburb detection) |

## User membership (user_communities)

Users can have multiple community relationships. The `membership_type` field records how a user is connected:

| Type | Meaning |
|---|---|
| `lives_here` | The user's home suburb or ward |
| `works_here` | The user's workplace area |
| `serves_here` | A ward councillor or community worker |
| `follows` | The user has opted in to follow this area's activity |
| `owns_business_here` | The user has a business registered in this area |

Only one community per user can have `is_primary = true` (enforced in application logic, not DB).

## Business service areas (business_service_areas)

Additive to the legacy `business_communities` many-to-many table. Supports richer relationship semantics:

| Relationship | Meaning |
|---|---|
| `based_in` | The business is physically located in this area |
| `serves` | The business actively serves customers in this area |
| `delivers_to` | The business offers delivery to this area |
| `available_in` | The business is available (e.g., online but locally relevant) |

The `getBusinessesForCommunity()` function queries both `business_communities` and `business_service_areas`, deduplicating by business ID, so legacy data remains fully functional.

## How community context is resolved for pages

When a user opens `/c/glenvista`, the `resolveCommunityContext()` function:

1. Fetches the community by slug (including its `parent_community_id` join)
2. Fetches child communities (suburbs of this ward, if this is a ward)
3. Fetches aliases for this community
4. Builds `relatedIds` — the community + its children + its parent — so that `getBusinessesForCommunity()` can return businesses tagged to any of these related areas
5. Builds `displayLabel` and `subLabel` for the page header

For a ward page (e.g., `/c/johannesburg-ward-23`), `subLabel` shows the first 4 suburb names.
For a suburb page (e.g., `/c/glenvista`), `subLabel` shows "Part of Ward 23".

## Friendly language

The frontend uses "neighbourhood" language rather than "ward" language wherever possible. The word "ward" has connotations of municipal bureaucracy and is not familiar to most residents. We use:

- "Neighbourhood" for suburbs
- "Neighbourhoods in this ward" for the child suburb list on ward pages
- The ward badge ("Municipal Ward 23") appears only on ward-type community pages, small, above the heading

## Future: PostGIS geometry column

The `community_boundaries` table currently stores GeoJSON as `jsonb`. Point-in-polygon queries (e.g., "which ward is this GPS coordinate in?") require PostGIS:

```sql
-- Future migration
alter table community_boundaries add column geom geometry(MultiPolygon, 4326);
create index idx_community_boundaries_geom on community_boundaries using gist(geom);
```

This would allow:
```sql
select c.* from communities c
join community_boundaries cb on cb.community_id = c.id
where ST_Contains(cb.geom, ST_SetSRID(ST_MakePoint(-26.2041, 28.0473), 4326));
```

PostGIS must be enabled in the Supabase project settings before running this migration.
