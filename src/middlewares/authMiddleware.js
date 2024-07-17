const jwt = require("jsonwebtoken");
const { tokenData, secretKey } = require("../utils/constants");

function generateToken() {
  const payload = {
    unique_name: "contato@tonilab.net",
    email: "contato@tonilab.net",
    id: "3ee31524-956a-4ca0-b20c-084013524b54",
    typ: "Bearer",
    iss: "API",
    aud: "*.tonilab.net",
  };

  // Gera o token sem expiração
  const token = jwt.sign(payload, secretKey);

  return token;
}

function decodeToken(token) {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (err) {
    console.error("Error decoding token:", err);
    return null;
  }
}

const authMiddleware = (req, res, next) => {
  const authorizationHeader = req.headers["authorization"];

  if (!authorizationHeader) {
    return res.status(401).send("Unauthorized");
  }

  const token = authorizationHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    // console.log({ decoded });
    const { id, email } = decoded;

    if (id === tokenData.id && email === tokenData.email) {
      next();
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (err) {
    res.status(401).send("Unauthorized");
  }
};

module.exports = authMiddleware;
