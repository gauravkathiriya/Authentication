const { app } = require("./index");

describe("/api/refresh endpoint", () => {
  let refreshHandler;
  let req, res;

  beforeAll(() => {
    // Extract the handler for /api/refresh
    const route = app._router.stack.find(
      (layer) => layer.route && layer.route.path === "/api/refresh"
    );
    if (!route) {
        throw new Error("Route not found");
    }
    refreshHandler = route.route.stack[0].handle;
  });

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("should fail if no token provided", () => {
    refreshHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith("you are not Authenticated.!!");
  });

  test("should fail if token not in refreshTokens", () => {
    req.body.token = "non-existent-token";
    refreshHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith("Refresh Token is not valid!!");
  });

  test("should work with valid token", (done) => {
    // Let's try to use the login route handler to add the token.
    const loginRoute = app._router.stack.find(
        (layer) => layer.route && layer.route.path === "/api/login"
    );
    const loginHandler = loginRoute.route.stack[0].handle;

    const loginReq = { body: { username: "gaurav", password: "Gaurav123" } };
    const loginRes = {
        json: jest.fn().mockImplementation((data) => {
            req.body.token = data.refreshToken;

            res.status = jest.fn().mockImplementation((code) => {
                expect(code).toBe(200);
                return res;
            });

            res.json = jest.fn().mockImplementation((data) => {
                expect(data).toHaveProperty("accessToken");
                expect(data).toHaveProperty("refreshToken");
                done();
                return res;
            });

            refreshHandler(req, res);
        })
    };

    loginHandler(loginReq, loginRes);
  });
});
