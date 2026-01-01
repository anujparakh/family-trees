# Database Schema Documentation

## Overview

The Family Trees database uses a normalized schema designed for:
- **Public viewing**: All trees are publicly viewable by default
- **Collaborative editing**: Multiple users can have edit access to a tree via roles
- **GEDCOM compatibility**: Follows standard genealogy data structures
- **Flexible relationships**: Supports complex family structures (remarriage, adoptions, etc.)
- **D1/SQLite**: Optimized for Cloudflare D1 database

## Schema Diagram

```
┌──────────────┐      ┌─────────────┐
│ tree_editors │      │    trees    │
├──────────────┤      ├─────────────┤
│ tree_id (FK) │─────►│ id (PK)     │
│ user_id      │◄───┐ │ name        │
│ role         │    │ │ is_public   │
└──────────────┘    │ │ root_person │───┐
                    │ └─────────────┘   │
    User's Clerk ID │                   │
                    │ ┌─────────────┐   │
                    │ │   persons   │◄──┘
                    │ ├─────────────┤
                    │ │ id (PK)     │
                    │ │ tree_id (FK)│
                    │ │ first_name  │
                    │ │ last_name   │
                    │ │ birth_date  │
                    │ │ death_date  │
                    │ │ gender      │
                    │ └─────────────┘
                    │       ▲
                    │       │
                    │       ├──────────────┐
                    │       │              │
                    │ ┌─────────────┐      │
                    │ │  families   │      │
                    │ ├─────────────┤      │
                    │ │ id (PK)     │      │
                    │ │ tree_id (FK)│      │
                    │ │ status      │      │
                    │ └─────────────┘      │
                    │       ▲              │
                    │       │              │
                    │       ├──────────┬───┘
                    │       │          │
                    │ ┌──────────────┐ ┌──────────────┐
                    │ │family_parents│ │family_children│
                    │ ├──────────────┤ ├──────────────┤
                    │ │family_id (FK)│ │family_id (FK)│
                    └─│person_id (FK)│ │person_id (FK)│
                      └──────────────┘ └──────────────┘
```

## Tables

### `trees`
Stores family tree metadata. Trees are publicly viewable by default.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PRIMARY KEY | Unique tree identifier (UUID) |
| `name` | TEXT NOT NULL | Display name for the tree |
| `description` | TEXT | Optional description |
| `root_person_id` | TEXT | Starting person for visualization |
| `is_public` | INTEGER | 1 = public (default), 0 = private |
| `created_at` | INTEGER | Unix timestamp |
| `updated_at` | INTEGER | Unix timestamp (auto-updated) |

**Indexes:**
- `idx_trees_root_person_id` - Fast lookup of root person
- `idx_trees_public` - Filter public vs private trees

**Access Control:**
- All public trees (`is_public = 1`) can be viewed by anyone
- Edit access is controlled via `tree_editors` table
- Private trees (`is_public = 0`) require viewer role in `tree_editors`

### `tree_editors`
Manages user access and roles for family trees.

| Column | Type | Description |
|--------|------|-------------|
| `tree_id` | TEXT NOT NULL | Foreign key to `trees` |
| `user_id` | TEXT NOT NULL | Clerk user ID |
| `role` | TEXT NOT NULL | User's role for this tree |
| `created_at` | INTEGER | Unix timestamp |

**Primary Key:** `(tree_id, user_id)`

**Valid Roles:**
- `owner` - Full control (edit, delete tree, manage editors)
- `editor` - Can edit persons and families
- `viewer` - Read-only access (for private trees)

**Indexes:**
- `idx_tree_editors_user_id` - Find all trees a user has access to
- `idx_tree_editors_role` - Find all editors for a tree

**Constraints:**
- Cascade delete when tree is deleted
- Role must be 'owner', 'editor', or 'viewer'

### `persons`
Stores individual people within a family tree.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PRIMARY KEY | Unique person identifier (UUID) |
| `tree_id` | TEXT NOT NULL | Foreign key to `trees` |
| `first_name` | TEXT NOT NULL | Given name |
| `last_name` | TEXT | Surname/family name |
| `birth_date` | TEXT | ISO 8601 date (YYYY-MM-DD) |
| `death_date` | TEXT | ISO 8601 date (YYYY-MM-DD) |
| `gender` | TEXT | 'male', 'female', or 'other' |
| `avatar_url` | TEXT | URL to profile picture |
| `notes` | TEXT | Additional biographical info |
| `created_at` | INTEGER | Unix timestamp |
| `updated_at` | INTEGER | Unix timestamp (auto-updated) |

**Indexes:**
- `idx_persons_tree_id` - Fast lookup by tree
- `idx_persons_name` - Fast search by name within tree

**Constraints:**
- Cascade delete when tree is deleted
- Gender must be 'male', 'female', or 'other'

### `families`
Represents family units (marriages, partnerships, or parent-child groups).

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PRIMARY KEY | Unique family identifier (UUID) |
| `tree_id` | TEXT NOT NULL | Foreign key to `trees` |
| `marriage_date` | TEXT | ISO 8601 date (YYYY-MM-DD) |
| `divorce_date` | TEXT | ISO 8601 date (YYYY-MM-DD) |
| `status` | TEXT | Relationship status |
| `notes` | TEXT | Additional family info |
| `created_at` | INTEGER | Unix timestamp |
| `updated_at` | INTEGER | Unix timestamp (auto-updated) |

**Valid Status Values:**
- `married` - Currently married
- `divorced` - Divorced
- `separated` - Separated but not divorced
- `partner` - Unmarried partnership
- `unknown` - Status unknown or not applicable

**Indexes:**
- `idx_families_tree_id` - Fast lookup by tree

**Constraints:**
- Cascade delete when tree is deleted

### `family_parents`
Join table linking parents to families (many-to-many).

| Column | Type | Description |
|--------|------|-------------|
| `family_id` | TEXT NOT NULL | Foreign key to `families` |
| `person_id` | TEXT NOT NULL | Foreign key to `persons` |
| `created_at` | INTEGER | Unix timestamp |

**Primary Key:** `(family_id, person_id)`

**Indexes:**
- `idx_family_parents_person_id` - Find families where person is a parent

**Constraints:**
- Cascade delete when family or person is deleted

### `family_children`
Join table linking children to families (many-to-many).

| Column | Type | Description |
|--------|------|-------------|
| `family_id` | TEXT NOT NULL | Foreign key to `families` |
| `person_id` | TEXT NOT NULL | Foreign key to `persons` |
| `birth_order` | INTEGER | Optional sibling order (1, 2, 3...) |
| `created_at` | INTEGER | Unix timestamp |

**Primary Key:** `(family_id, person_id)`

**Indexes:**
- `idx_family_children_person_id` - Find families where person is a child

**Constraints:**
- Cascade delete when family or person is deleted

## Key Design Decisions

### Why Collaborative Access Model?

**Public by Default**: All trees are publicly viewable, encouraging genealogy sharing and discovery.

**Role-Based Editing**: Users can be granted `owner`, `editor`, or `viewer` roles via `tree_editors` table.

**Multi-User Collaboration**: Multiple users can edit the same tree (family collaboration).

**Flexible Privacy**: Trees can be marked private (`is_public = 0`) for work-in-progress or sensitive data.

### Why Normalized Structure?

**Flexibility**: A person can be a parent in multiple families (remarriage, multiple partners).

**GEDCOM Compatible**: Aligns with standard genealogy data interchange format.

**Efficient Queries**: Separate join tables allow fast relationship lookups without data duplication.

### Why Join Tables?

In family trees, relationships are many-to-many:
- A person can be a **parent** in multiple families (remarriage)
- A person can be a **child** in one family (biological/adopted parents)
- A family can have multiple parents (typically 2, but could be 1 for single parents)
- A family can have multiple children

Using join tables (`family_parents`, `family_children`) allows proper normalization without data duplication.

### Example: Multiple Marriages

```
Person A marries Person B → Family 1 (children C, D)
Person A remarries Person E → Family 2 (children F, G)

family_parents:
  Family 1 → Person A
  Family 1 → Person B
  Family 2 → Person A
  Family 2 → Person E

family_children:
  Family 1 → Person C
  Family 1 → Person D
  Family 2 → Person F
  Family 2 → Person G
```

## Common Queries

### Check if user can edit a tree

```sql
SELECT role FROM tree_editors
WHERE tree_id = ? AND user_id = ?;
-- If returns 'owner' or 'editor', user can edit
```

### Get all trees a user can edit

```sql
SELECT t.*, te.role
FROM trees t
JOIN tree_editors te ON te.tree_id = t.id
WHERE te.user_id = ? AND te.role IN ('owner', 'editor')
ORDER BY t.updated_at DESC;
```

### Get all public trees

```sql
SELECT * FROM trees
WHERE is_public = 1
ORDER BY updated_at DESC;
```

### Get all editors for a tree

```sql
SELECT user_id, role FROM tree_editors
WHERE tree_id = ?
ORDER BY role, created_at;
```

### Get all persons in a tree

```sql
SELECT * FROM persons WHERE tree_id = ?;
```

### Get all families in a tree

```sql
SELECT * FROM families WHERE tree_id = ?;
```

### Get parents of a person

```sql
SELECT p.*
FROM persons p
JOIN family_parents fp ON fp.person_id = p.id
JOIN family_children fc ON fc.family_id = fp.family_id
WHERE fc.person_id = ?;
```

### Get children of a person

```sql
SELECT p.*
FROM persons p
JOIN family_children fc ON fc.person_id = p.id
JOIN family_parents fp ON fp.family_id = fc.family_id
WHERE fp.person_id = ?
ORDER BY fc.birth_order;
```

### Get spouses of a person

```sql
SELECT p.*
FROM persons p
JOIN family_parents fp1 ON fp1.person_id = p.id
JOIN family_parents fp2 ON fp2.family_id = fp1.family_id
WHERE fp2.person_id = ? AND fp1.person_id != ?;
```

### Get entire family tree structure

```sql
-- Get all persons
SELECT * FROM persons WHERE tree_id = ?;

-- Get all families with parents
SELECT
  f.*,
  GROUP_CONCAT(fp.person_id) as parent_ids
FROM families f
LEFT JOIN family_parents fp ON fp.family_id = f.id
WHERE f.tree_id = ?
GROUP BY f.id;

-- Get all families with children
SELECT
  f.id,
  GROUP_CONCAT(fc.person_id) as child_ids
FROM families f
LEFT JOIN family_children fc ON fc.family_id = f.id
WHERE f.tree_id = ?
GROUP BY f.id;
```

## Migrations

### Apply Migration

**Local development:**
```bash
npx wrangler d1 execute family-trees-db --local --file=./migrations/0001_initial_schema.sql
```

**Production:**
```bash
npx wrangler d1 execute family-trees-db --remote --file=./migrations/0001_initial_schema.sql
```

### Migration Naming Convention

Migrations follow the pattern: `XXXX_description.sql`
- `0001_initial_schema.sql` - Initial database schema
- `0002_add_notes_fields.sql` - Example future migration

### Creating New Migrations

1. Create file in `backend/migrations/` with next number
2. Write SQL with `CREATE TABLE IF NOT EXISTS` or `ALTER TABLE`
3. Test locally first: `npx wrangler d1 execute family-trees-db --local --file=./migrations/XXXX_name.sql`
4. Apply to production: `npx wrangler d1 execute family-trees-db --remote --file=./migrations/XXXX_name.sql`

## Data Integrity

### Cascading Deletes

When a **tree** is deleted:
- All `persons` in that tree are deleted
- All `families` in that tree are deleted
- All `family_parents` entries are deleted (via families)
- All `family_children` entries are deleted (via families)

When a **person** is deleted:
- All `family_parents` entries for that person are deleted
- All `family_children` entries for that person are deleted
- **Note**: Orphaned families remain (families with no parents/children). Clean up manually if needed.

### Auto-Updated Timestamps

Tables `trees`, `persons`, and `families` have triggers that automatically update `updated_at` timestamp on every UPDATE operation.

## Future Enhancements

**Possible additions:**
- `places` table for birth/death/marriage locations
- `sources` table for citing genealogy sources
- `media` table for photos, documents, etc.
- `events` table for life events (graduation, immigration, etc.)
- `relationships` table for non-biological relationships (godparents, guardians)
