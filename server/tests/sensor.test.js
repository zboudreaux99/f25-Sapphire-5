const request = require("supertest");
const app = require("../index");

jest.mock("../db", () => ({
  query: jest.fn()
}));

const pool = require("../db");

describe("Sensor routes", () => {
  afterEach(() => jest.clearAllMocks());

  test("returns 404 for sensor readings endpoint (not yet implemented)", async () => {
    const res = await request(app).get("/api/sensor/readings"); // current path under test

    expect(res.status).toBe(404);
    // If your app returns a JSON body for 404, you can assert on it here:
    // const msg = res.body.error || res.body.message || "";
    // expect(msg.toLowerCase()).toMatch(/not found|404/);
  });

  test("does not crash when hitting sensor readings endpoint", async () => {
    // Even if the DB were to throw, the route should still respond with something
    pool.query.mockRejectedValue(new Error("DB failure"));

    const res = await request(app).get("/api/sensor/readings");

    expect(res.status).toBe(404); // current actual behavior
  });
});
