const { generateAccessToken, verify } = require("./index");
const jwt = require("jsonwebtoken");

describe("Security - JWT Secret Management", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("should use JWT_ACCESS_SECRET from environment variable", () => {
    const secret = "my-super-secret-test-key";
    process.env.JWT_ACCESS_SECRET = secret;

    const user = { id: "123", isAdmin: false };
    const token = generateAccessToken(user);

    // Verify that the token was signed with our secret
    const decoded = jwt.verify(token, secret);
    expect(decoded.id).toBe(user.id);
  });

  test("should fail verification if JWT_ACCESS_SECRET is changed", () => {
    process.env.JWT_ACCESS_SECRET = "secret1";
    const user = { id: "123", isAdmin: false };
    const token = generateAccessToken(user);

    process.env.JWT_ACCESS_SECRET = "secret2";

    const req = {
      headers: { authorization: `Bearer ${token}` }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    const next = jest.fn();

    verify(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith("Token is not valid!");
    expect(next).not.toHaveBeenCalled();
  });
});
