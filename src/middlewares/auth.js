const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
    let bearerToken = req.headers.authorization.split(' ')
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"] || bearerToken[1];

  if (!token) {
    return res.status(403).send({responseData: null,responseMessage: "A token is required for authentication", status: false});
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send({responseData: null,responseMessage: "Invalid Token", status: false});
  }
  return next();
};

module.exports = verifyToken;