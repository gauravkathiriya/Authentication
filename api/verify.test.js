const { verify, generateAccessToken } = require("./index");
const jwt = require("jsonwebtoken");

describe("verify middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  test("should return 401 if no authorization header is provided", () => {
    verify(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith("You are not authenticated!");
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 403 if an invalid token is provided", (done) => {
    req.headers.authorization = "Bearer invalidtoken";

    res.status = jest.fn().mockImplementation((code) => {
      expect(code).toBe(403);
      return res;
    });

    res.json = jest.fn().mockImplementation((msg) => {
      expect(msg).toBe("Token is not valid!");
      expect(next).not.toHaveBeenCalled();
      done();
      return res;
    });

    verify(req, res, next);
  });

  test("should call next() and set req.user if a valid token is provided", (done) => {
    const user = { id: "1", isAdmin: true };
    const token = generateAccessToken(user);
    req.headers.authorization = `Bearer ${token}`;

    next.mockImplementation(() => {
      expect(req.user).toMatchObject(user);
      done();
    });

    verify(req, res, next);
  });
});
