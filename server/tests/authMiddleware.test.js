const authMiddleware = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn()
}));

describe("authMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test("returns 401 when no Authorization header is provided", () => {
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Missing token" });
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 401 for invalid or expired token", () => {
    req.headers.authorization = "Bearer faketoken";
    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid");
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired token" });
    expect(next).not.toHaveBeenCalled();
  });

  test("adds decoded user to req and calls next for valid token", () => {
    req.headers.authorization = "Bearer goodtoken";
    jwt.verify.mockReturnValue({ id: 5, role: "tenant" });

    authMiddleware(req, res, next);

    expect(req.user).toEqual({ id: 5, role: "tenant" });
    expect(next).toHaveBeenCalled();
  });
});
