-- Initial schema for Family Trees application
-- Supports collaborative family trees with GEDCOM-compatible structure
-- All trees are publicly viewable, edit access is controlled via tree_editors table

-- Family trees table - metadata for each tree
CREATE TABLE IF NOT EXISTS trees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  root_person_id TEXT, -- Will be set after persons are created
  is_public INTEGER NOT NULL DEFAULT 1, -- 1 = public (viewable by all), 0 = private
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_trees_root_person_id ON trees(root_person_id);
CREATE INDEX idx_trees_public ON trees(is_public);

-- Tree editors - users who have edit access to trees
CREATE TABLE IF NOT EXISTS tree_editors (
  tree_id TEXT NOT NULL,
  user_id TEXT NOT NULL, -- Clerk user ID
  role TEXT NOT NULL CHECK(role IN ('owner', 'editor', 'viewer')) DEFAULT 'editor',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (tree_id, user_id),
  FOREIGN KEY (tree_id) REFERENCES trees(id) ON DELETE CASCADE
);

CREATE INDEX idx_tree_editors_user_id ON tree_editors(user_id);
CREATE INDEX idx_tree_editors_role ON tree_editors(tree_id, role);

-- Persons table - individual people in family trees
CREATE TABLE IF NOT EXISTS persons (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  birth_date TEXT, -- ISO 8601 date string (YYYY-MM-DD)
  death_date TEXT, -- ISO 8601 date string (YYYY-MM-DD)
  gender TEXT CHECK(gender IN ('male', 'female', 'other')),
  avatar_url TEXT,
  notes TEXT, -- Additional information about the person
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (tree_id) REFERENCES trees(id) ON DELETE CASCADE
);

CREATE INDEX idx_persons_tree_id ON persons(tree_id);
CREATE INDEX idx_persons_name ON persons(tree_id, last_name, first_name);

-- Families table - family units (marriages, partnerships)
CREATE TABLE IF NOT EXISTS families (
  id TEXT PRIMARY KEY,
  tree_id TEXT NOT NULL,
  marriage_date TEXT, -- ISO 8601 date string
  divorce_date TEXT, -- ISO 8601 date string
  status TEXT CHECK(status IN ('married', 'divorced', 'separated', 'partner', 'unknown')) DEFAULT 'unknown',
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (tree_id) REFERENCES trees(id) ON DELETE CASCADE
);

CREATE INDEX idx_families_tree_id ON families(tree_id);

-- Family parents - many-to-many relationship between families and parent persons
CREATE TABLE IF NOT EXISTS family_parents (
  family_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (family_id, person_id),
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE
);

CREATE INDEX idx_family_parents_person_id ON family_parents(person_id);

-- Family children - many-to-many relationship between families and child persons
CREATE TABLE IF NOT EXISTS family_children (
  family_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  birth_order INTEGER, -- Optional: for ordering siblings (1, 2, 3, etc.)
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (family_id, person_id),
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE
);

CREATE INDEX idx_family_children_person_id ON family_children(person_id);

-- Trigger to update updated_at timestamp on trees
CREATE TRIGGER IF NOT EXISTS update_trees_timestamp
AFTER UPDATE ON trees
FOR EACH ROW
BEGIN
  UPDATE trees SET updated_at = unixepoch() WHERE id = NEW.id;
END;

-- Trigger to update updated_at timestamp on persons
CREATE TRIGGER IF NOT EXISTS update_persons_timestamp
AFTER UPDATE ON persons
FOR EACH ROW
BEGIN
  UPDATE persons SET updated_at = unixepoch() WHERE id = NEW.id;
END;

-- Trigger to update updated_at timestamp on families
CREATE TRIGGER IF NOT EXISTS update_families_timestamp
AFTER UPDATE ON families
FOR EACH ROW
BEGIN
  UPDATE families SET updated_at = unixepoch() WHERE id = NEW.id;
END;
