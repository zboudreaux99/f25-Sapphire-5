const request = require("supertest");
const app = require("../index");

jest.mock("../db", () => ({
  query: jest.fn()
}));

const pool = require("../db");

describe("GET /api/property/unit/units", () => {
  let originalError;

  // Silence console.error for these tests only
  beforeAll(() => {
    originalError = console.error;
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  afterEach(() => jest.clearAllMocks());

  test("returns 200 and a list of units for a property", async () => {
    // Mock DB rows that the route would normally return
    pool.query.mockResolvedValue({
      rows: [
        { unit_id: 1, unit_name: "Unit 101" },
        { unit_id: 2, unit_name: "Unit 102" }
      ]
    });

    const res = await request(app).get(
      "/api/property/unit/units?property_id=1"
    );

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("returns an error status if the database query fails", async () => {
    pool.query.mockRejectedValue(new Error("DB failure"));

    const res = await request(app).get(
      "/api/property/unit/units?property_id=1"
    );

    // Depending on how the route is written, it might send 500 or 400.
    expect([400, 500]).toContain(res.status);
    const msg = res.body.error || res.body.message || "";
    expect(msg.toLowerCase()).toMatch(/error|failed|server|unit/i);
  });
});
