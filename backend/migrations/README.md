# Database Migrations

This directory contains SQL migration files for the Family Trees database.

## Migration Files

- `0001_initial_schema.sql` - Initial database schema with tables for trees, persons, families, and relationships
- `0002_seed_example_tree.sql` - Seeds an example family tree (Smith/Johnson family) for demonstration

## Applying Migrations

### Local Development

```bash
# Navigate to backend directory
cd backend

# Apply initial schema
npx wrangler d1 execute family-trees-db --local --file=./migrations/0001_initial_schema.sql

# Seed example tree
npx wrangler d1 execute family-trees-db --local --file=./migrations/0002_seed_example_tree.sql

# Verify data was inserted
npx wrangler d1 execute family-trees-db --local --command "SELECT COUNT(*) as count FROM persons WHERE tree_id = 'example-tree-001';"
```

### Production

**Important:** Always test migrations locally first!

```bash
# Apply schema to production
npx wrangler d1 execute family-trees-db --remote --file=./migrations/0001_initial_schema.sql

# Seed example tree (optional - you may not want demo data in production)
npx wrangler d1 execute family-trees-db --remote --file=./migrations/0002_seed_example_tree.sql
```

## Example Tree Details

The seeded example tree (`example-tree-001`) contains:
- **16 people** across 4 generations
- **5 families** demonstrating various relationship types
- **Demonstrates**:
  - Multiple marriages (Margaret married William, then Robert after divorce)
  - Divorce status (William & Margaret)
  - Half-siblings (Lisa is half-sister to John and Sarah)
  - Extended family relationships

**Tree Structure:**
```
William Smith + Margaret Johnson (divorced)
├── John Smith + Mary Wilson
│   ├── Emma Smith
│   └── Michael Smith
└── Sarah Smith + David Johnson
    ├── Sophia Johnson
    ├── James Johnson
    └── Oliver Johnson

Margaret Johnson + Robert Brown (second marriage)
└── Lisa Brown + Thomas Anderson
    ├── Ava Anderson
    └── Noah Anderson
```

## Creating New Migrations

1. **Create file** with next sequential number:
   ```
   migrations/XXXX_description.sql
   ```

2. **Write SQL** using `CREATE TABLE IF NOT EXISTS` or `ALTER TABLE`:
   ```sql
   -- 0003_add_places_table.sql
   CREATE TABLE IF NOT EXISTS places (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     ...
   );
   ```

3. **Test locally**:
   ```bash
   npx wrangler d1 execute family-trees-db --local --file=./migrations/0003_add_places_table.sql
   ```

4. **Apply to production** after testing:
   ```bash
   npx wrangler d1 execute family-trees-db --remote --file=./migrations/0003_add_places_table.sql
   ```

## Migration Best Practices

- ✅ **Always use `IF NOT EXISTS`** for idempotent migrations
- ✅ **Test locally first** before applying to production
- ✅ **One logical change per migration** (easier to rollback)
- ✅ **Add indexes** for foreign keys and frequently queried columns
- ✅ **Include comments** explaining complex changes
- ❌ **Never modify existing migration files** (create new ones instead)
- ❌ **Don't delete old migrations** (keep migration history)

## Troubleshooting

### Error: "no such table"
- Migration wasn't applied. Run: `npx wrangler d1 execute family-trees-db --local --file=./migrations/0001_initial_schema.sql`

### Error: "UNIQUE constraint failed"
- Example tree already exists. Skip migration 0002 or delete existing data:
  ```bash
  npx wrangler d1 execute family-trees-db --local --command "DELETE FROM trees WHERE id = 'example-tree-001';"
  ```

### View example tree data
```bash
# List all persons in example tree
npx wrangler d1 execute family-trees-db --local --command "SELECT id, first_name, last_name FROM persons WHERE tree_id = 'example-tree-001';"

# List all families
npx wrangler d1 execute family-trees-db --local --command "SELECT id, status, marriage_date FROM families WHERE tree_id = 'example-tree-001';"
```
