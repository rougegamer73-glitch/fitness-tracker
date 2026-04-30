const jwt = require('jsonwebtoken');

function authMiddleware(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throwHttpError('Authentication token required', 401);
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      walletAddress: payload.walletAddress
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      error.statusCode = 401;
    }

    next(error);
  }
}

function throwHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

module.exports = authMiddleware;
