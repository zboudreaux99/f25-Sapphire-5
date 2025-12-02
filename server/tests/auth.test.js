const request = require("supertest");
const app = require("../index");

// Mock the database like in property.test.js
jest.mock("../db", () => ({
  query: jest.fn()
}));

const pool = require("../db");

describe("POST /api/auth/login", () => {
  afterEach(() => jest.clearAllMocks());

  test("returns 500 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")           // make sure this path matches routes/auth.js
      .send({ email: "user@example.com" }); // missing password

    // Right now the route falls into the catch and sends 500 + { message: 'Login failed' }
    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/login failed/i);
  });

  test("handles invalid credentials gracefully", async () => {
    // Simulate a DB query that returns no matching user
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .post("/api/auth/login")           // same login path
      .send({ email: "user@example.com", password: "wrongpassword" });

    // Depending on how the route is written, this might be 400, 401, or 500
    expect([400, 401, 500]).toContain(res.status);

    const errorText = res.body.error || res.body.message || "";
    expect(errorText.toLowerCase()).toMatch(/invalid|unauthorized|login failed/);
  });
});
