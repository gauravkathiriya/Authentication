const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
app.use(express.json());
const cors = require("cors");
app.use(cors());

const users = [
  {
    id: "1",
    username: "gaurav",
    password: "Gaurav123",
    isAdmin: true,
  },
  {
    id: "2",
    username: "jenil",
    password: "Jenil132",
    isAdmin: false,
  },
];

const refreshTokens = new Set();

app.post("/api/refresh", (req, res) => {
  //take the refresh token from the user
  const refreshToken = req.body.token;

  //send error if there is no token or it's invalid
  if (!refreshToken) {
    return res.status(401).json("you are not Authenticated.!!");
  }
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(401).json("Refresh Token is not valid!!");
  }
  jwt.verify(refreshToken, "myRefreshSecretKey", (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).json("Token is not valid!");
    }
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToknen = generateAccessToken(user);
    const newRefreshAccessToknen = generateRefreshToken(user);

    refreshTokens.add(newRefreshAccessToknen);

    res.status(200).json({
      accessToken: newAccessToknen,
      refreshToken: newRefreshAccessToknen,
    });
  });
  //if everything is ok, create new access token, refresh token and send to user
});

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, "mySecretKey", {
    expiresIn: "15s",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, "myRefreshSecretKey");
};

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });

  if (user) {
    // Generate JWT
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.add(refreshToken);

    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(400).json("Username and Password is Incorrect");
  }
});

const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, "mySecretKey", (err, user) => {
      if (err) {
        return res.status(403).json("Token is not valid!");
      }
      req.user = user; // Corrected here
      next();
    });
  } else {
    res.status(401).json("You are not authenticated!");
  }
};

app.delete("/api/users/:userId", verify, (req, res) => {
  if (req.user.id === req.params.userId || req.user.isAdmin) {
    res.status(200).json("User is deleted successfully.");
  } else {
    res.status(403).json("You are not allowed to delete.");
  }
});

app.post("/api/logout", verify, (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens.delete(refreshToken);
  res.status(200).json("you logOut Successfully.");
});

if (require.main === module) {
  app.listen(5000, () => console.log("Backend server is running!"));
}

module.exports = {
  verify,
  generateAccessToken,
};
