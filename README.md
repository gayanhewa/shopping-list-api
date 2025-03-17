# shopping-list-api

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.4. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

# Get all items in a list
GET /api/items/list/:listId

# Create an item in a list
POST /api/items/list/:listId
{
  "name": "Milk",
  "description": "2% milk",
  "quantity": 2
}

# Get a specific item
GET /api/items/:id

# Update an item
PUT /api/items/:id
{
  "name": "Updated Item",
  "description": "Updated description",
  "quantity": 3,
  "isDone": true
}

# Delete an item
DELETE /api/items/:id
