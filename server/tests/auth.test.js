const request = require("supertest");
const app = require("../index");
const bcrypt = require("bcrypt");

// Mock the database
jest.mock("../db", () => ({
  query: jest.fn()
}));

const pool = require("../db");

describe("POST /api/auth/login", () => {
  afterEach(() => jest.clearAllMocks());

  test("returns 500 when email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "somepassword" }); // missing email

    // Without email, pool.query will be called with out required inputs; this will cause an error that's caught, returning 500
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Login failed");
  });

  test("returns 500 when password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@example.com" }); // missing password

    // Without password, bcrypt.compare will fail; this will cause an error that's caught, returning 500
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Login failed");
  });

  test("returns 500 when both email and password are missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({});

    // Without both password and email, pool.query and bcrypt.compare will both fail; this will cause an error that's caught, returning 500
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Login failed");
  });

  test("returns 400 when user does not exist", async () => {
    // Simulate a DB query that returns no matching user
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nonexistent@example.com", password: "somepassword" });

    // If a user doesn't exist, that will create an error that is caught, returning 400
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid credentials");
  });

  test("returns 400 when password is incorrect", async () => {
    const hashedPassword = await bcrypt.hash("correctpassword", 10);
      
    pool.query.mockResolvedValue({
      rows: [{
        user_id: 2,
        email: "johndoe@example.com",
        password_hash: hashedPassword,
        role: "manager"
      }]
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "johndoe@example.com", password: "wrongpassword" });

    // Passing in a correct email with the incorrect password will produce an error that is caught, returning 400
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid credentials");
  });
});