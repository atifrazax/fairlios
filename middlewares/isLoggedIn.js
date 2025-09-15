const jwt = require('jsonwebtoken');

// Middleware to check if user is logged in via JWT token in cookies
const isLoggedIn = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            req.flash('error', 'Please login first');
            return res.redirect('/login');
        } else {
        const tokenData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = tokenData; // Attach user data to request object
        next();
        }
    } catch {
        res.clearCookie('token');
        req.flash('error', 'Invalid token, Please login again');
        return res.redirect('/login');
    }
}

module.exports = isLoggedIn;