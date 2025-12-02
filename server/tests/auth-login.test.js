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

  describe("Successful login for different user roles", () => {
    test("admin user can login successfully", async () => {
      // Using the actual hash from the database script for admin
      pool.query.mockResolvedValue({
        rows: [{
          user_id: 1,
          email: "admin@sapphire.com",
          password_hash: "$2a$10$ichrhI/KPhAwBuzitTCyFuUOOXqdhjnmFWzoqrZRHDaxkI/BrmzkC",
          role: "admin"
        }]
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "admin@sapphire.com", password: "admin" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toEqual({
        id: 1,
        email: "admin@sapphire.com",
        role: "admin"
      });
      expect(typeof res.body.token).toBe("string");
    });

    test("manager user (John Doe) can login successfully", async () => {
      pool.query.mockResolvedValue({
        rows: [{
          user_id: 2,
          email: "johndoe@example.com",
          password_hash: "$2a$10$CBpe7tl6GK1vdnCBTpDazOoiU0Yf9Pd2uqBlVn6z/uZVCE4XmyCoK",
          role: "manager"
        }]
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "johndoe@example.com", password: "manager" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toEqual({
        id: 2,
        email: "johndoe@example.com",
        role: "manager"
      });
      expect(typeof res.body.token).toBe("string");
    });

    test("manager user (Jane Smith) can login successfully", async () => {
      pool.query.mockResolvedValue({
        rows: [{
          user_id: 4,
          email: "janesmith@example.com",
          password_hash: "$2a$10$CBpe7tl6GK1vdnCBTpDazOoiU0Yf9Pd2uqBlVn6z/uZVCE4XmyCoK",
          role: "manager"
        }]
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "janesmith@example.com", password: "manager" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toEqual({
        id: 4,
        email: "janesmith@example.com",
        role: "manager"
      });
      expect(typeof res.body.token).toBe("string");
    });

    test("tenant user (Alice) can login successfully", async () => {
      pool.query.mockResolvedValue({
        rows: [{
          user_id: 3,
          email: "alice@example.com",
          password_hash: "$2a$10$Py.BXLT4fh1DDW7/.kzhJe6f.HAzcl5ogyHiYcE/2b9qI0BuA4rQi",
          role: "tenant"
        }]
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "alice@example.com", password: "tenant" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toEqual({
        id: 3,
        email: "alice@example.com",
        role: "tenant"
      });
      expect(typeof res.body.token).toBe("string");
    });

    test("tenant user (Karen) can login successfully", async () => {
      pool.query.mockResolvedValue({
        rows: [{
          user_id: 5,
          email: "karen@example.com",
          password_hash: "$2a$10$Py.BXLT4fh1DDW7/.kzhJe6f.HAzcl5ogyHiYcE/2b9qI0BuA4rQi",
          role: "tenant"
        }]
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "karen@example.com", password: "tenant" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toEqual({
        id: 5,
        email: "karen@example.com",
        role: "tenant"
      });
      expect(typeof res.body.token).toBe("string");
    });

    test("tenant user (Kyle) can login successfully", async () => {
      pool.query.mockResolvedValue({
        rows: [{
          user_id: 6,
          email: "kyle@example.com",
          password_hash: "$2a$10$Py.BXLT4fh1DDW7/.kzhJe6f.HAzcl5ogyHiYcE/2b9qI0BuA4rQi",
          role: "tenant"
        }]
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "kyle@example.com", password: "tenant" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toEqual({
        id: 6,
        email: "kyle@example.com",
        role: "tenant"
      });
      expect(typeof res.body.token).toBe("string");
    });

    test("tenant user (Warren) can login successfully", async () => {
      pool.query.mockResolvedValue({
        rows: [{
          user_id: 7,
          email: "warren@example.com",
          password_hash: "$2a$10$Py.BXLT4fh1DDW7/.kzhJe6f.HAzcl5ogyHiYcE/2b9qI0BuA4rQi",
          role: "tenant"
        }]
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "warren@example.com", password: "tenant" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toEqual({
        id: 7,
        email: "warren@example.com",
        role: "tenant"
      });
      expect(typeof res.body.token).toBe("string");
    });
  });

  describe("JWT token validation", () => {
    test("returned token contains correct user id and role", async () => {
      const jwt = require("jsonwebtoken");
      
      pool.query.mockResolvedValue({
        rows: [{
          user_id: 1,
          email: "admin@sapphire.com",
          password_hash: "$2a$10$ichrhI/KPhAwBuzitTCyFuUOOXqdhjnmFWzoqrZRHDaxkI/BrmzkC",
          role: "admin"
        }]
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "admin@sapphire.com", password: "admin" });

      expect(res.status).toBe(200);
      
      // Decode the token to verify its contents
      const decoded = jwt.decode(res.body.token);
      expect(decoded).toHaveProperty("id", 1);
      expect(decoded).toHaveProperty("role", "admin");
      expect(decoded).toHaveProperty("exp"); // Should have expiration
      expect(decoded).toHaveProperty("iat"); // Should have issued at
    });
  });

  describe("Email case sensitivity", () => {
    test("login fails with uppercase email when database has lowercase", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "ADMIN@SAPPHIRE.COM", password: "admin" });

      // email is case sensitive, so passing in an all caps email will produce an error, returning 400
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid credentials");
    });
  });
});