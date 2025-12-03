const request = require("supertest");
const app = require("../index");

// We still mock the DB for the create route (POST)
jest.mock("../db", () => ({
  query: jest.fn()
}));

const pool = require("../db");

describe("Property operations (create + current behavior for update/delete)", () => {
  afterEach(() => jest.clearAllMocks());

  // ========================
  // CREATE PROPERTY
  // ========================

  test("POST /api/property - creates property successfully", async () => {
    pool.query.mockResolvedValue({
      rows: [
        {
          property_id: 1,
          name: "Test Property",
          address001: "123 Road"
        }
      ]
    });

    const res = await request(app)
      .post("/api/property")
      .send({ name: "Test Property", address001: "123 Road" });

    expect(res.status).toBe(201);
    expect(res.body.property_id).toBe(1);
  });

  test("POST /api/property - returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/property")
      .send({ name: "Only name, no address" });

    expect(res.status).toBe(400);
  });

  // ========================
  // UPDATE PROPERTY (currently not implemented)
  // ========================

  test("PUT /api/property/:id - returns 404 (update route not implemented yet)", async () => {
    const res = await request(app)
      .put("/api/property/1")
      .send({
        name: "Updated Name",
        address001: "Updated Address"
      });

    expect(res.status).toBe(404);
  });

  test("PUT /api/property/:id with missing body also returns 404", async () => {
    const res = await request(app)
      .put("/api/property/1")
      .send({});

    expect(res.status).toBe(404);
  });

  // ========================
  // DELETE PROPERTY (currently not implemented)
  // ========================

  test("DELETE /api/property/:id - returns 404 (delete route not implemented yet)", async () => {
    const res = await request(app).delete("/api/property/1");
    expect(res.status).toBe(404);
  });
});
