const request = require("supertest");
const app = require("../index");

// Mock the database
jest.mock("../db", () => ({
  query: jest.fn()
}));

const pool = require("../db");

describe("POST /api/property", () => {
  afterEach(() => jest.clearAllMocks());

  test("returns 400 if required fields missing", async () => {
    const res = await request(app)
      .post("/api/property")
      .send({ name: "Test" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Missing required/);
  });

  test("creates property", async () => {
    pool.query.mockResolvedValue({
      rows: [{
        property_id: 1,
        name: "Test",
        address001: "123 St"
      }]
    });

    const res = await request(app)
      .post("/api/property")
      .send({ name: "Test", address001: "123 St" });

    expect(res.status).toBe(201);
    expect(res.body.property_id).toBe(1);
    expect(res.body.message).toBe("Property created.");
  });
});

