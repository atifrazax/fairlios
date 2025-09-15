const express = require('express');
const connectDB = require('./config/db');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const auth = require('./middlewares/auth');
const helmet = require('./middlewares/helmet');
const rateLimit = require('./utils/rate-limit');
const clearCache = require('./middlewares/clearCache');
// Connect to MongoDB
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));
app.use(flash());
app.use(cookieParser());

// Middleware for session management
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set to true if using https
}));

app.use(auth); 

// Make flash messages available to all views
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.formData = req.flash("data")[0] || {};
  next();
});

app.use(clearCache); // clear cache after every request
// app.use(helmet); // Security Middlewares
app.use(rateLimit); // Rate Limit Middleware

// Routes
app.use('/', require('./routes/frontend.routes'));

// Start the server
app.listen(process.env.PORT, () => {
    console.log(`✅ Server is running...`);
});