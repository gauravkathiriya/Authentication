const { app, generateAccessToken } = require("./index");
const jwt = require("jsonwebtoken");
const axios = require("axios");

describe("POST /api/refresh", () => {
  let server;
  const port = 5001;
  const baseUrl = `http://localhost:${port}/api`;

  beforeAll((done) => {
    server = app.listen(port, () => {
      done();
    });
  });

  afterAll((done) => {
    server.close(() => {
      done();
    });
  });

  test("should return new tokens if a valid refresh token is provided", async () => {
    // 1. Login to get a refresh token
    const loginRes = await axios.post(`${baseUrl}/login`, {
      username: "gaurav",
      password: "Gaurav123"
    });
    const refreshToken = loginRes.data.refreshToken;

    // 2. Refresh tokens
    const refreshRes = await axios.post(`${baseUrl}/refresh`, {
      token: refreshToken
    });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.data).toHaveProperty("accessToken");
    expect(refreshRes.data).toHaveProperty("refreshToken");
  });

  test("should return 401 if no token is provided", async () => {
    try {
      await axios.post(`${baseUrl}/refresh`, {});
    } catch (error) {
      expect(error.response.status).toBe(401);
      expect(error.response.data).toBe("you are not Authenticated.!!");
    }
  });

  test("should return 401 if an invalid refresh token is provided", async () => {
    try {
      await axios.post(`${baseUrl}/refresh`, {
        token: "invalidtoken"
      });
    } catch (error) {
      expect(error.response.status).toBe(401);
      expect(error.response.data).toBe("Refresh Token is not valid!!");
    }
  });
});
