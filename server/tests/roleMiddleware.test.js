const roleMiddleware = require("../middleware/roleMiddleware");

describe("roleMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: { role: "tenant" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test("allows access when role is allowed", () => {
    const middleware = roleMiddleware(["tenant", "manager"]);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("blocks access when role not allowed", () => {
    const middleware = roleMiddleware(["manager"]);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Access denied" });
    expect(next).not.toHaveBeenCalled();
  });
});
