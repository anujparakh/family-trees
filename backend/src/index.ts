import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Env, AuthUser } from "./types";
import { clerkAuth } from "./middleware/auth";
import trees from "./routes/trees";
import persons from "./routes/persons";
import families from "./routes/families";
import editors from "./routes/editors";

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

// ---------------------
// Mount API Routes
// ---------------------

// Trees routes (includes both public and protected)
app.route("/trees", trees);

// Persons routes
app.route("/persons", persons);

// Families routes
app.route("/families", families);

// Tree editors routes
app.route("/editors", editors);

// Protected routes - require authentication
const protectedRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();
protectedRoutes.use("*", clerkAuth());

// User info endpoint
protectedRoutes.get("/me", (c) => {
  const user = c.get("user");
  return c.json({
    userId: user.userId,
    sessionId: user.sessionId,
    message: "This is your authenticated user info",
  });
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
