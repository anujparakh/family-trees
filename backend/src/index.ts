import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Env, AuthUser } from "./types";
import { clerkAuth } from "./middleware/auth";

// Define app with proper typing
type Variables = {
  user: AuthUser;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:8001",
      "http://localhost:8002",
      "https://trees.anujparakh.dev",
    ], // Add your frontend URLs
    credentials: true,
  })
);

// -------------
// Public routes
// -------------

app.get("/", (c) => {
  return c.json({
    message: "Family Trees API",
    version: "1.0.0",
    status: "healthy",
  });
});

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Public tree listing - anyone can view public trees
app.get("/trees/public", async (c) => {
  try {
    const result = await c.env.DB.prepare(
      `SELECT id, name, description, root_person_id, created_at, updated_at
       FROM trees
       WHERE is_public = 1
       ORDER BY updated_at DESC
       LIMIT 100`
    ).all();

    return c.json({
      trees: result.results,
      count: result.results.length,
    });
  } catch (error) {
    console.error("Database error:", error);
    return c.json({ error: "Failed to fetch public trees" }, 500);
  }
});

// Protected routes - require authentication
const protectedRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();
protectedRoutes.use("*", clerkAuth());

// Example protected route
protectedRoutes.get("/me", (c) => {
  const user = c.get("user");
  return c.json({
    userId: user.userId,
    sessionId: user.sessionId,
    message: "This is your authenticated user info",
  });
});

// -------------------------
// - User Protected Routes -
// -------------------------

// Example D1 database query - get trees the user can edit
protectedRoutes.get("/trees", async (c) => {
  const user = c.get("user");

  try {
    // Get trees the user has edit access to
    const result = await c.env.DB.prepare(
      `SELECT t.*, te.role
       FROM trees t
       JOIN tree_editors te ON te.tree_id = t.id
       WHERE te.user_id = ? AND te.role IN ('owner', 'editor')
       ORDER BY t.updated_at DESC`
    )
      .bind(user.userId)
      .all();

    return c.json({
      trees: result.results,
      count: result.results.length,
    });
  } catch (error) {
    console.error("Database error:", error);
    return c.json({ error: "Failed to fetch trees" }, 500);
  }
});

// Mount protected routes under /api
app.route("/api", protectedRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("Server error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
