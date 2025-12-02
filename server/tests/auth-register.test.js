const request = require("supertest");
const app = require("../index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Mock the database
jest.mock("../db", () => ({
  query: jest.fn()
}));

const pool = require("../db");

describe("POST /api/auth/register", () => {
  afterEach(() => jest.clearAllMocks());

  describe("Validation errors", () => {
    test("returns 400 when email is missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ password: "password123", role: "tenant" });
      
      // email is a required field, so leaving it out will produce an error returning 400
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email, password, and role are required");
    });

    test("returns 400 when password is missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "newuser@example.com", role: "tenant" });

      // password is a required field, so leaving it out will produce an error returning 400
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email, password, and role are required");
    });

    test("returns 400 when role is missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "newuser@example.com", password: "password123" });

      // role is a required field, so leaving it out will produce an error returning 400
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email, password, and role are required");
    });

    test("returns 400 when all fields are missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({});

      // email, password, and role are a required fields, so leaving them all out will produce an error returning 400
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email, password, and role are required");
    });

    test("returns 400 when email already exists", async () => {
      // Simulate PostgreSQL unique constraint violation (error code 23505)
      const duplicateError = new Error("duplicate key value");
      duplicateError.code = '23505';
      pool.query.mockRejectedValue(duplicateError);

      const res = await request(app)
        .post("/api/auth/register")
        .send({ 
          email: "admin@sapphire.com", 
          password: "password123", 
          role: "tenant" 
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email already exists");
    });
  });

  describe("Successful registration", () => {
    test("successfully registers a new tenant user", async () => {
      pool.query.mockResolvedValue({
        rows: [{
          user_id: 10,
          email: "newtenant@example.com",
          role: "tenant"
        }]
      });

      const res = await request(app)
        .post("/api/auth/register")
        .send({ 
          email: "newtenant@example.com", 
          password: "securepassword", 
          role: "tenant" 
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toEqual({
        user_id: 10,
        email: "newtenant@example.com",
        role: "tenant"
      });
      expect(typeof res.body.token).toBe("string");
    });

    test("successfully registers a new manager user", async () => {
      pool.query.mockResolvedValue({
        rows: [{
          user_id: 11,
          email: "newmanager@example.com",
          role: "manager"
        }]
      });

      const res = await request(app)
        .post("/api/auth/register")
        .send({ 
          email: "newmanager@example.com", 
          password: "managerpass", 
          role: "manager" 
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toEqual({
        user_id: 11,
        email: "newmanager@example.com",
        role: "manager"
      });
      expect(typeof res.body.token).toBe("string");
    });

    test("successfully registers a new admin user", async () => {
      pool.query.mockResolvedValue({
        rows: [{
          user_id: 12,
          email: "newadmin@example.com",
          role: "admin"
        }]
      });

      const res = await request(app)
        .post("/api/auth/register")
        .send({ 
          email: "newadmin@example.com", 
          password: "adminpass", 
          role: "admin" 
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toEqual({
        user_id: 12,
        email: "newadmin@example.com",
        role: "admin"
      });
      expect(typeof res.body.token).toBe("string");
    });
  });

  describe("Password hashing", () => {
    test("password is hashed before storing in database", async () => {
      pool.query.mockResolvedValue({
        rows: [{
          user_id: 13,
          email: "hashtest@example.com",
          role: "tenant"
        }]
      });

      await request(app)
        .post("/api/auth/register")
        .send({ 
          email: "hashtest@example.com", 
          password: "plaintextpassword", 
          role: "tenant" 
        });

      // Verify pool.query was called
      expect(pool.query).toHaveBeenCalled();
      
      // Get the arguments passed to pool.query
      const queryArgs = pool.query.mock.calls[0];
      const hashedPassword = queryArgs[1][1]; // Second parameter in the array
      
      // Verify the password was hashed (not plain text)
      expect(hashedPassword).not.toBe("plaintextpassword");
      
      // Verify the hash can be compared with the original password
      const isValid = await bcrypt.compare("plaintextpassword", hashedPassword);
      expect(isValid).toBe(true);
    });
  });

  describe("JWT token validation", () => {
    test("returned token contains correct user id and role", async () => {
      pool.query.mockResolvedValue({
        rows: [{
          user_id: 14,
          email: "tokentest@example.com",
          role: "tenant"
        }]
      });

      const res = await request(app)
        .post("/api/auth/register")
        .send({ 
          email: "tokentest@example.com", 
          password: "password123", 
          role: "tenant" 
        });

      expect(res.status).toBe(200);
      
      // Decode the token to verify its contents
      const decoded = jwt.decode(res.body.token);
      expect(decoded).toHaveProperty("id", 14);
      expect(decoded).toHaveProperty("role", "tenant");
      expect(decoded).toHaveProperty("exp"); // Should have expiration
      expect(decoded).toHaveProperty("iat"); // Should have issued at
      
      // Verify token expires in approximately 1 hour
      const expiresIn = decoded.exp - decoded.iat;
      expect(expiresIn).toBe(3600); // 1 hour in seconds
    });
  });

  describe("Database error handling", () => {
    test("returns 500 when database query fails", async () => {
      // Simulate a generic database error
      pool.query.mockRejectedValue(new Error("Database connection failed"));

      const res = await request(app)
        .post("/api/auth/register")
        .send({ 
          email: "error@example.com", 
          password: "password123", 
          role: "tenant" 
        });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Registration failed");
    });
  });
});