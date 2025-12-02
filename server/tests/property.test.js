const request = require("supertest");
const app = require("../index");

// Mock the database
jest.mock("../db", () => ({
  query: jest.fn()
}));

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
  jest.clearAllMocks();
});


const pool = require("../db");

const testPostEndpoint = ({ path, validPayload, requiredFields, dbResponse, dbError, expectedStatus, expectedMessagePattern }) => {
  describe(`POST ${path}`, () => {
    test("returns 400 if required fields missing", async () => {
      const payload = {};
      requiredFields.forEach(field => payload[field] = validPayload[field]);
      // remove one field to trigger validation error
      delete payload[requiredFields[0]];
      const res = await request(app)
        .post(path)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Missing required/);
    });

    test("creates successfully", async () => {
      pool.query.mockResolvedValue({ rows: [dbResponse] });
      const res = await request(app)
        .post(path)
        .send(validPayload);

      expect(res.status).toBe(expectedStatus);
      expect(res.body.property_id || res.body.id).toBe(dbResponse.property_id || dbResponse.id);
      expect(res.body.message).toMatch(expectedMessagePattern);
    });

    test("database query fails", async () => {
      pool.query.mockRejectedValue(new Error(dbError || 'Database failure'));
      const res = await request(app)
        .post(path)
        .send(validPayload);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Database query failed.');
    });
  });
};

const testGetEndpoint = ({ path, requiredQueryParams, dbResponse, dbError }) => {
  describe(`GET ${path}`, () => {
    test("returns 400 if required query parameters missing", async () => {
      const query = { ...requiredQueryParams };
      delete query[Object.keys(requiredQueryParams)[0]]; // remove one required param

      const res = await request(app)
        .get(path)
        .query(query);

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Missing required/);
    });

    test("returns data successfully", async () => {
      pool.query.mockResolvedValue({ rows: dbResponse });

      const res = await request(app)
        .get(path)
        .query(requiredQueryParams);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(dbResponse);
    });

    test("database query fails", async () => {
      pool.query.mockRejectedValue(new Error(dbError || "Database failure"));

      const res = await request(app)
        .get(path)
        .query(requiredQueryParams);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Database query failed.");
    });

  });
};


// =======================
// POST Endpoints
// =======================

// POST /api/property
testPostEndpoint({
  path: "/api/property",
  validPayload: { name: "Test", address001: "123 St" },
  requiredFields: ["name", "address001"],
  dbResponse: { property_id: 1, name: "Test", address001: "123 St" },
  expectedStatus: 201,
  expectedMessagePattern: /created|updated/i
});

// POST /api/property
testPostEndpoint({
  path: "/api/property",
  validPayload: {property_id: 1, name: "Test", address001: "123 St" },
  requiredFields: ["name", "address001"],
  dbResponse: { property_id: 1, name: "Test", address001: "123 St" },
  expectedStatus: 201,
  expectedMessagePattern: /created|updated/i
});

// POST /api/property/remove
testPostEndpoint({
  path: "/api/property/remove",
  validPayload: { property_id: 3 },
  requiredFields: ["property_id"],
  dbResponse: { property_id: 3, name: "Test Property" },
  expectedStatus: 200,
  expectedMessagePattern: /removed/i
});

// POST /api/property/unit
testPostEndpoint({
  path: "/api/property/unit",
  validPayload: { name: "Unit A", property_id: 1 },
  requiredFields: ["name", "property_id"],
  dbResponse: { unit_id: 1, name: "Unit A" },
  expectedStatus: 201,
  expectedMessagePattern: /created|updated/i
});

// POST /api/property/unit/tenant
testPostEndpoint({
  path: "/api/property/unit/tenant",
  validPayload: { user_id: 1, unit_id: 1, name: "Tenant A" },
  requiredFields: ["user_id", "unit_id", "name"],
  dbResponse: { tenant_id: 1, unit_id: 1, name: "Tenant A" },
  expectedStatus: 201,
  expectedMessagePattern: /created/i
});

// POST /api/property/unit/tenant/remove
testPostEndpoint({
  path: "/api/property/unit/tenant/remove",
  validPayload: { tenant_id: 1 },
  requiredFields: ["tenant_id"],
  dbResponse: { tenant_id: 1, unit_id: 1, name: "Tenant A" },
  expectedStatus: 201,
  expectedMessagePattern: /removed/i
});

// POST /api/property/rewards
testPostEndpoint({
  path: "/api/property/rewards",
  validPayload: { name: "Reward A", property_id: 1, description: "Reward desc" },
  requiredFields: ["name", "property_id", "description"],
  dbResponse: { reward_id: 1, name: "Reward A", description: "Reward desc", is_active: true },
  expectedStatus: 201,
  expectedMessagePattern: /created/i
});

// POST /api/property/unit/rewards
testPostEndpoint({
  path: "/api/property/unit/rewards",
  validPayload: { unit_id: 1, property_id: 1, reward_id: 1 },
  requiredFields: ["unit_id", "property_id", "reward_id"],
  dbResponse: {},
  expectedStatus: 201,
  expectedMessagePattern: /created/i
});

// POST /api/property/rule
testPostEndpoint({
  path: "/api/property/rule",
  validPayload: { property_id: 1, description: "Noise rule", threshold_db: 70, start_time: "22:00", end_time: "06:00", days_of_week: ["Mon","Tue"] },
  requiredFields: ["property_id", "description", "threshold_db", "start_time", "end_time", "days_of_week"],
  dbResponse: { noise_rule_id: 1, property_id: 1, description: "Noise rule" },
  expectedStatus: 201,
  expectedMessagePattern: /created/i
});

// POST /api/property/complaints
testPostEndpoint({
  path: "/api/property/complaints",
  validPayload: { initiating_tenant_id: 1, complained_about_unit_id: 2, description: "Complaint description" },
  requiredFields: ["initiating_tenant_id", "complained_about_unit_id", "description"],
  dbResponse: { complaint_id: 1, description: "Complaint description" },
  expectedStatus: 201,
  expectedMessagePattern: /created/i
});

// POST /api/property/complaints/update
testPostEndpoint({
  path: "/api/property/complaints/update",
  validPayload: { complaint_id: 1, status: "resolved" },
  requiredFields: ["complaint_id", "status"],
  dbResponse: { complaint_id: 1, status: "resolved" },
  expectedStatus: 201,
  expectedMessagePattern: /updated/i
});

// =======================
// GET Endpoints
// =======================

// GET /api/property/managers
testGetEndpoint({
  path: "/api/property/managers",
  requiredQueryParams: { property_id: 1 },
  dbResponse: [{ manager_id: 1, property_id: 1, name: "Manager A" }]
});

// GET /api/property/unit/units
testGetEndpoint({
  path: "/api/property/unit/units",
  requiredQueryParams: { property_id: 1 },
  dbResponse: [{ unit_id: 1, name: "Unit A" }]
});

// GET /api/property/unit
testGetEndpoint({
  path: "/api/property/unit",
  requiredQueryParams: { unit_id: 1 },
  dbResponse: [{ unit_id: 1, name: "Unit A" }]
});

// GET /api/property/unit/tenants
testGetEndpoint({
  path: "/api/property/unit/tenants",
  requiredQueryParams: { property_id: 1 },
  dbResponse: [{ tenant_id: 1, unit_id: 1, name: "Tenant A" }]
});

// GET /api/property/unit/tenant
testGetEndpoint({
  path: "/api/property/unit/tenant",
  requiredQueryParams: { unit_id: 1 },
  dbResponse: [{ tenant_id: 1, name: "Tenant A" }]
});

// GET /api/property/unit/sensors
testGetEndpoint({
  path: "/api/property/unit/sensors",
  requiredQueryParams: { unit_id: 1 },
  dbResponse: [{ sensor_id: 1, unit_id: 1, type: "Temperature" }]
});

// GET /api/property/rewards
testGetEndpoint({
  path: "/api/property/rewards",
  requiredQueryParams: { property_id: 1 },
  dbResponse: [{ reward_id: 1, name: "Reward A" }]
});

// GET /api/property/unit/rewards
testGetEndpoint({
  path: "/api/property/unit/rewards",
  requiredQueryParams: { unit_id: 1 },
  dbResponse: [{ unit_id: 1, reward_id: 1 }]
});

// GET /api/property/rule
testGetEndpoint({
  path: "/api/property/rule",
  requiredQueryParams: { property_id: 1 },
  dbResponse: [{ noise_rule_id: 1, property_id: 1, description: "Noise rule" }]
});

// GET /api/property/complaints
testGetEndpoint({
  path: "/api/property/complaints",
  requiredQueryParams: { property_id: 1 },
  dbResponse: [{ complaint_id: 1, description: "Complaint description" }]
});