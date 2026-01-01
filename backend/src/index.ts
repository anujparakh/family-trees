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

// Public routes
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

// Example D1 database query
protectedRoutes.get("/families", async (c) => {
  const user = c.get("user");

  try {
    // Example query - you'll need to create this table
    const result = await c.env.DB.prepare(
      "SELECT * FROM families WHERE user_id = ?"
    )
      .bind(user.userId)
      .all();

    return c.json({
      families: result.results,
      count: result.results.length,
    });
  } catch (error) {
    console.error("Database error:", error);
    return c.json({ error: "Failed to fetch families" }, 500);
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
