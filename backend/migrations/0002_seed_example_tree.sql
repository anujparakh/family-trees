-- Seed example family tree using Smith/Johnson family data
-- This creates a publicly viewable demo tree for users to explore

-- Insert example tree
INSERT INTO trees (id, name, description, root_person_id, is_public, created_at, updated_at)
VALUES (
  'example-tree-001',
  'Smith Family Tree',
  'An example family tree showing the Smith-Johnson-Brown-Anderson families across four generations. This demonstrates multiple marriages, remarriage, and complex family relationships.',
  'p1',
  1,
  unixepoch(),
  unixepoch()
);

-- Grant ownership to a system/demo user (can be updated later)
INSERT INTO tree_editors (tree_id, user_id, role, created_at)
VALUES (
  'example-tree-001',
  'system',
  'owner',
  unixepoch()
);

-- Insert all persons (16 people across 4 generations)

-- Generation 0 - Grandparents
INSERT INTO persons (id, tree_id, first_name, last_name, birth_date, death_date, gender, created_at, updated_at)
VALUES
  ('p1', 'example-tree-001', 'William', 'Smith', '1945-03-15', '2015-11-22', 'male', unixepoch(), unixepoch()),
  ('p2', 'example-tree-001', 'Margaret', 'Johnson', '1947-07-22', NULL, 'female', unixepoch(), unixepoch());

-- Generation 1 - Parents
INSERT INTO persons (id, tree_id, first_name, last_name, birth_date, death_date, gender, created_at, updated_at)
VALUES
  ('p3', 'example-tree-001', 'John', 'Smith', '1970-05-10', NULL, 'male', unixepoch(), unixepoch()),
  ('p4', 'example-tree-001', 'Mary', 'Wilson', '1972-09-18', NULL, 'female', unixepoch(), unixepoch()),
  ('p5', 'example-tree-001', 'Sarah', 'Smith', '1968-12-03', NULL, 'female', unixepoch(), unixepoch()),
  ('p6', 'example-tree-001', 'David', 'Johnson', '1967-02-14', NULL, 'male', unixepoch(), unixepoch());

-- Generation 2 - Children
INSERT INTO persons (id, tree_id, first_name, last_name, birth_date, death_date, gender, created_at, updated_at)
VALUES
  ('p7', 'example-tree-001', 'Emma', 'Smith', '1998-06-12', NULL, 'female', unixepoch(), unixepoch()),
  ('p8', 'example-tree-001', 'Michael', 'Smith', '2000-11-08', NULL, 'male', unixepoch(), unixepoch()),
  ('p9', 'example-tree-001', 'Sophia', 'Johnson', '1995-01-20', NULL, 'female', unixepoch(), unixepoch()),
  ('p10', 'example-tree-001', 'James', 'Johnson', '1997-08-15', NULL, 'male', unixepoch(), unixepoch()),
  ('p11', 'example-tree-001', 'Oliver', 'Johnson', '2002-04-25', NULL, 'male', unixepoch(), unixepoch());

-- Extended family - Margaret's second marriage
INSERT INTO persons (id, tree_id, first_name, last_name, birth_date, death_date, gender, created_at, updated_at)
VALUES
  ('p12', 'example-tree-001', 'Robert', 'Brown', '1946-10-05', NULL, 'male', unixepoch(), unixepoch()),
  ('p13', 'example-tree-001', 'Lisa', 'Brown', '1980-03-30', NULL, 'female', unixepoch(), unixepoch()),
  ('p14', 'example-tree-001', 'Thomas', 'Anderson', '1978-07-12', NULL, 'male', unixepoch(), unixepoch());

-- Generation 3 - Grandchildren
INSERT INTO persons (id, tree_id, first_name, last_name, birth_date, death_date, gender, created_at, updated_at)
VALUES
  ('p15', 'example-tree-001', 'Ava', 'Anderson', '2005-09-18', NULL, 'female', unixepoch(), unixepoch()),
  ('p16', 'example-tree-001', 'Noah', 'Anderson', '2008-12-22', NULL, 'male', unixepoch(), unixepoch());

-- Insert families (5 family units)

-- Family 1: William & Margaret -> John, Sarah (divorced)
INSERT INTO families (id, tree_id, marriage_date, divorce_date, status, created_at, updated_at)
VALUES (
  'f1',
  'example-tree-001',
  '1967-06-15',
  '1976-03-10',
  'divorced',
  unixepoch(),
  unixepoch()
);

-- Family 2: John & Mary -> Emma, Michael (married)
INSERT INTO families (id, tree_id, marriage_date, divorce_date, status, created_at, updated_at)
VALUES (
  'f2',
  'example-tree-001',
  '1995-08-20',
  NULL,
  'married',
  unixepoch(),
  unixepoch()
);

-- Family 3: Sarah & David -> Sophia, James, Oliver (married)
INSERT INTO families (id, tree_id, marriage_date, divorce_date, status, created_at, updated_at)
VALUES (
  'f3',
  'example-tree-001',
  '1993-05-12',
  NULL,
  'married',
  unixepoch(),
  unixepoch()
);

-- Family 4: Margaret & Robert -> Lisa (second marriage)
INSERT INTO families (id, tree_id, marriage_date, divorce_date, status, created_at, updated_at)
VALUES (
  'f4',
  'example-tree-001',
  '1978-11-10',
  NULL,
  'married',
  unixepoch(),
  unixepoch()
);

-- Family 5: Lisa & Thomas -> Ava, Noah (married)
INSERT INTO families (id, tree_id, marriage_date, divorce_date, status, created_at, updated_at)
VALUES (
  'f5',
  'example-tree-001',
  '2003-04-18',
  NULL,
  'married',
  unixepoch(),
  unixepoch()
);

-- Insert family_parents relationships

-- Family 1 parents
INSERT INTO family_parents (family_id, person_id, created_at)
VALUES
  ('f1', 'p1', unixepoch()),
  ('f1', 'p2', unixepoch());

-- Family 2 parents
INSERT INTO family_parents (family_id, person_id, created_at)
VALUES
  ('f2', 'p3', unixepoch()),
  ('f2', 'p4', unixepoch());

-- Family 3 parents
INSERT INTO family_parents (family_id, person_id, created_at)
VALUES
  ('f3', 'p5', unixepoch()),
  ('f3', 'p6', unixepoch());

-- Family 4 parents
INSERT INTO family_parents (family_id, person_id, created_at)
VALUES
  ('f4', 'p2', unixepoch()),
  ('f4', 'p12', unixepoch());

-- Family 5 parents
INSERT INTO family_parents (family_id, person_id, created_at)
VALUES
  ('f5', 'p13', unixepoch()),
  ('f5', 'p14', unixepoch());

-- Insert family_children relationships

-- Family 1 children (John, Sarah)
INSERT INTO family_children (family_id, person_id, birth_order, created_at)
VALUES
  ('f1', 'p3', 1, unixepoch()),
  ('f1', 'p5', 2, unixepoch());

-- Family 2 children (Emma, Michael)
INSERT INTO family_children (family_id, person_id, birth_order, created_at)
VALUES
  ('f2', 'p7', 1, unixepoch()),
  ('f2', 'p8', 2, unixepoch());

-- Family 3 children (Sophia, James, Oliver)
INSERT INTO family_children (family_id, person_id, birth_order, created_at)
VALUES
  ('f3', 'p9', 1, unixepoch()),
  ('f3', 'p10', 2, unixepoch()),
  ('f3', 'p11', 3, unixepoch());

-- Family 4 children (Lisa)
INSERT INTO family_children (family_id, person_id, birth_order, created_at)
VALUES
  ('f4', 'p13', 1, unixepoch());

-- Family 5 children (Ava, Noah)
INSERT INTO family_children (family_id, person_id, birth_order, created_at)
VALUES
  ('f5', 'p15', 1, unixepoch()),
  ('f5', 'p16', 2, unixepoch());
