const jwt = require('jsonwebtoken');
const isGuest = (req, res, next) => {
const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // attach user so EJS knows they’re logged in
      // req.user = decoded;
      res.locals.user = decoded;
      return next();
      
    } catch (err) {
      res.locals.user = null;
      res.clearCookie('token');
      return next(createError("Invalid token, Please login again", 401));
    }
  }

  res.locals.user = null;
  req.user = null;
  next(); // no token → allow guest
};

module.exports = isGuest;
