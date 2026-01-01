# Family Trees API Documentation

## Overview

The Family Trees API provides RESTful endpoints for managing family tree data with role-based access control. All endpoints return JSON responses.

**Base URL**: `/`

**Authentication**: Uses Clerk JWT tokens via `Authorization: Bearer <token>` header.

## Access Control Model

### Tree Visibility
- **Public Trees** (`is_public = 1`): Viewable by anyone (authenticated or anonymous)
- **Private Trees** (`is_public = 0`): Only viewable by users with editor access

### User Roles
- **Owner**: Full control - can edit tree, manage editors, delete tree
- **Editor**: Can edit tree data (persons, families) but cannot manage editors
- **Viewer**: Read-only access to private trees

### Endpoint Access Patterns
- **Public Read**: Anyone can read public trees, authenticated users can read trees they have access to
- **Edit Operations**: Require `editor` or `owner` role
- **Management Operations**: Require `owner` role (managing editors, deleting tree)

---

## Trees

### List Public Trees
```
GET /trees/public
```

Returns all public trees.

**Authentication**: None required

**Response**:
```json
{
  "trees": [
    {
      "id": "uuid",
      "name": "Smith Family Tree",
      "description": "The Smith family lineage",
      "root_person_id": "p1",
      "is_public": 1,
      "created_at": 1234567890,
      "updated_at": 1234567890
    }
  ],
  "count": 1
}
```

---

### List User's Trees
```
GET /trees
```

Returns all trees the authenticated user can edit.

**Authentication**: Required

**Response**:
```json
{
  "trees": [
    {
      "id": "uuid",
      "name": "My Family Tree",
      "description": "...",
      "root_person_id": "p1",
      "is_public": 0,
      "role": "owner",
      "created_at": 1234567890,
      "updated_at": 1234567890
    }
  ],
  "count": 1
}
```

---

### Get Tree by ID
```
GET /trees/:treeId
```

Get a single tree. Works for public trees or trees the user has access to.

**Authentication**: Optional (required for private trees)

**Response**:
```json
{
  "tree": {
    "id": "uuid",
    "name": "Smith Family Tree",
    "description": "...",
    "root_person_id": "p1",
    "is_public": 1,
    "created_at": 1234567890,
    "updated_at": 1234567890
  }
}
```

**Errors**:
- `404`: Tree not found or is private

---

### Get Complete Tree Data
```
GET /trees/:treeId/complete
```

Get tree with all persons and families. Works for public trees or trees the user has access to.

**Authentication**: Optional (required for private trees)

**Response**:
```json
{
  "tree": {
    "id": "uuid",
    "name": "Smith Family Tree",
    "description": "...",
    "rootPersonId": "p1",
    "persons": {
      "p1": {
        "id": "p1",
        "firstName": "John",
        "lastName": "Smith",
        "birthDate": "1950-01-01",
        "deathDate": null,
        "gender": "M",
        "avatarUrl": null
      }
    },
    "families": [
      {
        "id": "f1",
        "parents": ["p1", "p2"],
        "children": ["p3", "p4"],
        "marriageDate": "1975-06-15",
        "divorceDate": null,
        "status": "married"
      }
    ]
  }
}
```

---

### Create Tree
```
POST /trees
```

Create a new tree. The creator is automatically added as owner.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "My Family Tree",
  "description": "Optional description",
  "isPublic": true
}
```

**Response**: `201 Created`
```json
{
  "tree": {
    "id": "uuid",
    "name": "My Family Tree",
    "description": "...",
    "root_person_id": null,
    "is_public": 1,
    "created_at": 1234567890,
    "updated_at": 1234567890
  }
}
```

**Errors**:
- `400`: Name is required

---

### Update Tree
```
PATCH /trees/:treeId
```

Update tree metadata. Requires editor or owner role.

**Authentication**: Required

**Request Body** (all fields optional):
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "isPublic": false,
  "rootPersonId": "p1"
}
```

**Response**:
```json
{
  "tree": {
    "id": "uuid",
    "name": "Updated Name",
    ...
  }
}
```

**Errors**:
- `400`: No fields to update
- `403`: User does not have edit access

---

### Delete Tree
```
DELETE /trees/:treeId
```

Delete a tree and all associated data. Requires owner role.

**Authentication**: Required

**Response**:
```json
{
  "message": "Tree deleted successfully"
}
```

**Errors**:
- `403`: User is not the tree owner

---

## Persons

### List Persons in Tree
```
GET /persons/tree/:treeId
```

Get all persons in a tree. Works for public trees or trees the user has access to.

**Authentication**: Optional (required for private trees)

**Response**:
```json
{
  "persons": [
    {
      "id": "p1",
      "tree_id": "uuid",
      "first_name": "John",
      "last_name": "Smith",
      "birth_date": "1950-01-01",
      "death_date": null,
      "gender": "M",
      "avatar_url": null,
      "notes": null,
      "created_at": 1234567890,
      "updated_at": 1234567890
    }
  ],
  "count": 1
}
```

**Errors**:
- `404`: Tree not found or is private

---

### Get Person by ID
```
GET /persons/:personId
```

Get a single person. Works for public trees or trees the user has access to.

**Authentication**: Optional (required for private trees)

**Response**:
```json
{
  "person": {
    "id": "p1",
    "tree_id": "uuid",
    "first_name": "John",
    ...
  }
}
```

**Errors**:
- `404`: Person not found or tree is private

---

### Create Person
```
POST /persons
```

Create a new person in a tree. Requires editor or owner role.

**Authentication**: Required

**Request Body**:
```json
{
  "treeId": "uuid",
  "firstName": "Jane",
  "lastName": "Doe",
  "birthDate": "1980-05-15",
  "deathDate": null,
  "gender": "F",
  "avatarUrl": "https://...",
  "notes": "Optional notes"
}
```

**Response**: `201 Created`
```json
{
  "person": {
    "id": "uuid",
    "tree_id": "uuid",
    "first_name": "Jane",
    ...
  }
}
```

**Errors**:
- `400`: Tree ID and first name are required
- `403`: User does not have edit access to tree

---

### Update Person
```
PATCH /persons/:personId
```

Update a person's details. Requires editor or owner role.

**Authentication**: Required

**Request Body** (all fields optional):
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "birthDate": "1980-05-15",
  "deathDate": "2050-01-01",
  "gender": "F",
  "avatarUrl": "https://...",
  "notes": "Updated notes"
}
```

**Response**:
```json
{
  "person": {
    "id": "uuid",
    ...
  }
}
```

**Errors**:
- `400`: No fields to update
- `403`: User does not have edit access
- `404`: Person not found

---

### Delete Person
```
DELETE /persons/:personId
```

Delete a person. Requires editor or owner role.

**Authentication**: Required

**Response**:
```json
{
  "message": "Person deleted successfully"
}
```

**Errors**:
- `403`: User does not have edit access
- `404`: Person not found

---

## Families

### List Families in Tree
```
GET /families/tree/:treeId
```

Get all families in a tree with parents and children. Works for public trees or trees the user has access to.

**Authentication**: Optional (required for private trees)

**Response**:
```json
{
  "families": [
    {
      "id": "f1",
      "treeId": "uuid",
      "parents": ["p1", "p2"],
      "children": ["p3", "p4"],
      "marriageDate": "1975-06-15",
      "divorceDate": null,
      "status": "married",
      "notes": null
    }
  ],
  "count": 1
}
```

**Errors**:
- `404`: Tree not found or is private

---

### Get Family by ID
```
GET /families/:familyId
```

Get a single family with parents and children. Works for public trees or trees the user has access to.

**Authentication**: Optional (required for private trees)

**Response**:
```json
{
  "family": {
    "id": "f1",
    "treeId": "uuid",
    "parents": ["p1", "p2"],
    "children": ["p3", "p4"],
    "marriageDate": "1975-06-15",
    "divorceDate": null,
    "status": "married",
    "notes": null
  }
}
```

**Errors**:
- `404`: Family not found or tree is private

---

### Create Family
```
POST /families
```

Create a new family with parents and children. Requires editor or owner role.

**Authentication**: Required

**Request Body**:
```json
{
  "treeId": "uuid",
  "parents": ["p1", "p2"],
  "children": ["p3", "p4"],
  "marriageDate": "1975-06-15",
  "divorceDate": null,
  "status": "married",
  "notes": "Optional notes"
}
```

**Response**: `201 Created`
```json
{
  "family": {
    "id": "uuid",
    "treeId": "uuid",
    "parents": ["p1", "p2"],
    "children": ["p3", "p4"],
    ...
  }
}
```

**Errors**:
- `400`: Tree ID is required
- `403`: User does not have edit access to tree

---

### Update Family
```
PATCH /families/:familyId
```

Update a family's details, parents, or children. Requires editor or owner role.

**Authentication**: Required

**Request Body** (all fields optional):
```json
{
  "parents": ["p1", "p5"],
  "children": ["p3", "p4", "p6"],
  "marriageDate": "1975-06-15",
  "divorceDate": "2000-01-01",
  "status": "divorced",
  "notes": "Updated notes"
}
```

**Note**: Providing `parents` or `children` arrays will replace all existing relationships.

**Response**:
```json
{
  "family": {
    "id": "uuid",
    ...
  }
}
```

**Errors**:
- `403`: User does not have edit access
- `404`: Family not found

---

### Delete Family
```
DELETE /families/:familyId
```

Delete a family and all parent/child relationships. Requires editor or owner role.

**Authentication**: Required

**Response**:
```json
{
  "message": "Family deleted successfully"
}
```

**Errors**:
- `403`: User does not have edit access
- `404`: Family not found

---

## Tree Editors

### List Tree Editors
```
GET /editors/tree/:treeId
```

Get all editors for a tree. Works for public trees or trees the user has access to.

**Authentication**: Optional (required for private trees)

**Response**:
```json
{
  "editors": [
    {
      "user_id": "user_abc123",
      "role": "owner",
      "created_at": 1234567890
    },
    {
      "user_id": "user_xyz789",
      "role": "editor",
      "created_at": 1234567891
    }
  ],
  "count": 2
}
```

**Errors**:
- `404`: Tree not found or is private

---

### Add Editor
```
POST /editors
```

Add a new editor to a tree. Requires owner role.

**Authentication**: Required

**Request Body**:
```json
{
  "treeId": "uuid",
  "userId": "user_abc123",
  "role": "editor"
}
```

**Role Options**: `owner`, `editor`, `viewer`

**Response**: `201 Created`
```json
{
  "editor": {
    "user_id": "user_abc123",
    "role": "editor",
    "created_at": 1234567890
  }
}
```

**Errors**:
- `400`: Tree ID and user ID are required / Invalid role
- `403`: Only the tree owner can add editors
- `409`: User already has access to this tree

---

### Update Editor Role
```
PATCH /editors/:treeId/:userId
```

Update an editor's role. Requires owner role.

**Authentication**: Required

**Request Body**:
```json
{
  "role": "viewer"
}
```

**Response**:
```json
{
  "editor": {
    "user_id": "user_abc123",
    "role": "viewer",
    "created_at": 1234567890
  }
}
```

**Errors**:
- `400`: Role is required / Invalid role
- `403`: Only the tree owner can update editors
- `404`: User does not have access to this tree

---

### Remove Editor
```
DELETE /editors/:treeId/:userId
```

Remove an editor from a tree. Requires owner role.

**Authentication**: Required

**Response**:
```json
{
  "message": "Editor removed successfully"
}
```

**Errors**:
- `400`: Cannot remove yourself as the only owner
- `403`: Only the tree owner can remove editors

---

## Common HTTP Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters or missing required fields
- `401 Unauthorized`: Authentication required but not provided
- `403 Forbidden`: User does not have permission for this operation
- `404 Not Found`: Resource not found or is private
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

---

## Authentication

Include the Clerk JWT token in the Authorization header:

```
Authorization: Bearer <your-clerk-jwt-token>
```

For endpoints that support optional authentication, the API will check for the token and grant appropriate access:
- **With valid token**: Access to public trees + user's private trees
- **Without token**: Access to public trees only

---

## Examples

### Creating a Complete Family Tree

```javascript
// 1. Create a tree
const tree = await fetch('/trees', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Family Tree',
    isPublic: true
  })
}).then(r => r.json());

// 2. Create persons
const grandpa = await fetch('/persons', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    treeId: tree.tree.id,
    firstName: 'John',
    lastName: 'Smith',
    birthDate: '1950-01-01',
    gender: 'M'
  })
}).then(r => r.json());

const grandma = await fetch('/persons', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    treeId: tree.tree.id,
    firstName: 'Jane',
    lastName: 'Smith',
    birthDate: '1952-03-15',
    gender: 'F'
  })
}).then(r => r.json());

const father = await fetch('/persons', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    treeId: tree.tree.id,
    firstName: 'Michael',
    lastName: 'Smith',
    birthDate: '1975-06-20',
    gender: 'M'
  })
}).then(r => r.json());

// 3. Create family
const family = await fetch('/families', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    treeId: tree.tree.id,
    parents: [grandpa.person.id, grandma.person.id],
    children: [father.person.id],
    marriageDate: '1974-08-10',
    status: 'married'
  })
}).then(r => r.json());

// 4. Set root person
await fetch(`/trees/${tree.tree.id}`, {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    rootPersonId: grandpa.person.id
  })
});
```

### Sharing a Tree with Collaborators

```javascript
// Add an editor
await fetch('/editors', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    treeId: 'tree-uuid',
    userId: 'user_abc123',
    role: 'editor'
  })
});

// Update to viewer
await fetch('/editors/tree-uuid/user_abc123', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    role: 'viewer'
  })
});
```
