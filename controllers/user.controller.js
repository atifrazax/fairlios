const User = require("../models/user.model");
const Expense = require("../models/expense.model");
const Group = require("../models/group.model");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const createError = require('../utils/error.msgs');
const paginate = require('../utils/paginate');
const mongoose = require('mongoose');
const sendMail = require("../utils/brevoMail");
const sendSMS = require("../utils/sendSMS");
const ipData = require("../utils/ipData");
const weatherData = require("../utils/weatherData");


/// Register Page
const registerPage = (req, res) => {
    res.status(200).render("register");
};
// Register new user
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });  // validation check will be handled by mongoose schema
    
    if (user && user.isVerified === false) {
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    const confirmURL = `${req.protocol}://${req.get('host')}/verify/${token}`;

    const mailResponse = await sendMail( {
      email,
      subject: "Welcome to FAIRLIOS",
      message: `Hi ${name}, \n\nWelcome to FAIRLIOS. \n\nPlease verify your email address within 2 hours by clicking the link below.\n\n${confirmURL}\n\nThanks,\n\nTeam FAIRLIOS`,
    });
    if (!mailResponse) {
      await User.findByIdAndDelete(user._id);
      req.flash("error", "Verification link could not be sent to your email, Try again later.");
      return res.redirect('/register');
    }
  }else {
    req.flash("error", "Something went wrong, Please try again.");
    return res.redirect('/register');
  }
    req.flash("success", "Account registered successfully. Verify your email by clicking the link sent to your email.");
    res.redirect('/login');

  } catch (err) {
  const messages = [];
  if (err.name === 'ValidationError' && err.errors) {
  
    for (let field in err.errors) {
      messages.push(err.errors[field].message);
    }
    req.flash("error", messages);
    req.flash("data", req.body);
    return res.redirect('/register');
    
  } else if (err.code === 11000 || err.message.includes("already exists")) {
    messages.push(`Email already exists!`);

    req.flash("error", messages);
    req.flash("data", req.body);
    return res.redirect('/register');

    } else {
    return next(err);
  }
}

};
// Login Page
const loginPage = (req, res) => {
    res.status(200).render("login");
};

// Login user with jwt token & cookie-parser
const loginUser = async (req, res, next) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      req.flash("error", "Please fill all fields");
      return res.redirect("/login");
    }
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "User not found, Please register first.");
      return res.redirect("/register");
    }
    // password match through bcrypt method in user model
    if( user && (await user.matchPassword(password))) {
      if (user.isVerified === false) {
        req.flash("error", "Please verify your email first. Check your inbox or spam folder.");
        return res.redirect("/login");
      } else if (user.isVerified === true) {

        // IP API
        const ip = await ipData(req);
        // Weather API
        const weatherIcon = await weatherData(ip.latitude, ip.longitude);
      // generate JWT token
      const tokenData = { _id: user._id, name: user.name, email: user.email, weatherIcon: weatherIcon, timezone: ip.timezone };
      const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '1d' });
      // Store token in cookie
      res.cookie('token', token, { httpOnly: true, maxAge: 24*60*60*1000 }); // 24 hours
      res.redirect('/');
      }

  } else {
      // return res.status(401).render('login',{ message: "Invalid email or password" });
      req.flash("error", "Invalid email or password");
      req.flash("data", req.body);
      res.redirect("/login");
    }
  }
  catch (err) {
    return next(err);
  }
}
// Dashboard - show grouped expenses
const dashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 👉 1. Get paginated groups where user is a member
    const paginatedGroups = await paginate(
      Group,
      { members: userId },
      req.query,
      {
        populate: [
          { path: "members", select: "name email" },
          { path: "createdBy", select: "name email" },
        ],
        sort: "-updatedAt",
      },
      { lean: true }
    );

    const groups = paginatedGroups.data;
    const paginatedMeta = paginatedGroups.meta;

    let groupedExpenses = {};
    let groupTotals = {};

    // 👉 2. Calculate per group expenses
    for (const group of groups) {
      const expenses = await Expense.find({ group: group._id })
        .populate("createdBy", "name email").lean();

      groupTotals[group.expenseCode] = {
        total: 0,
        perUser: {},
        spentByYou: 0,
        updatedAt: group.updatedAt,
      };

      groupedExpenses[group.expenseCode] = [];

      expenses.forEach((exp) => {
        groupedExpenses[group.expenseCode].push({
          title: exp.title,
          amount: exp.amount,
          note: exp.note,
          date: exp.date,
          userName: exp.createdBy?.name || "Unknown",
        });

        // Track totals
        groupTotals[group.expenseCode].total += exp.amount;

        groupTotals[group.expenseCode].perUser[exp.createdBy._id] = {
          name: exp.createdBy.name,
          total:
            (groupTotals[group.expenseCode].perUser[exp.createdBy._id]?.total ||
              0) + exp.amount,
        };

        // Logged-in user's contribution in this group
        if (String(exp.createdBy?._id) === String(userId)) {
          groupTotals[group.expenseCode].spentByYou += exp.amount;
        }
      });
    }

    // 👉 3. Calculate total expenses spent by this user across ALL groups (ignoring pagination)
    const totalSpentByUser = await Expense.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalExpenses = totalSpentByUser[0]?.total || 0;
    // Greeting
        const timezone = req.user.timezone || "+05:00";
        const now = new Date();
        const options = { timeZone: timezone, hour: "2-digit", hour12: false };
        const formatter = new Intl.DateTimeFormat("en-GB", options);
        const hour = parseInt(formatter.format(now));
        console.log(hour); // Always 0–23
        const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : hour < 23 ? "Good Evening" : "Hello";

    // 👉 4. Render without perUserOverall (privacy issue removed)
    res.render("dashboard", {
      user: req.user,
      groups,
      groupedExpenses,
      groupTotals,
      totalExpenses, // ✅ only logged-in user's total across ALL groups
      paginatedMeta,
      greeting
    });
  } catch (err) {
    return next(err);
  }
};

// Logout
const logout = (req, res, next) => {
  try {
    res.clearCookie("token"); // remove JWT cookie
    req.user = null;
    res.locals.user = null;
    req.flash("success", "You are logged out!");
    return res.redirect("/login");
  } catch (err) {
    return next(err);
  }
};

// Profile Update Page
const profilePage = async (req, res, next) => {
  try {
    if (!req.user) {
      req.flash("error", "Please login first");
      return res.redirect("/login");
    }
    res.status(200).render("profile", { user: req.user });
  } catch (err) {
    // res.status(500).render('500',{ message: error.message });
    return next(err);
  }
}
// Update Profile
const updateProfile = async (req, res, next) => {
  try {

    const { name, password } = req.body;
    const userId = req.user;

    const userRecord = await User.findById(userId);

    if (!userRecord) {
      req.flash("error", "User not found");
      return res.redirect('/profile');
    }
  //  userRecord.email = email || userRecord.email;
   userRecord.name = name || userRecord.name;

    if (password && password.trim() !== "" && password.length >= 4) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      userRecord.password = hashedPassword;
    }

    await User.findByIdAndUpdate(userId, userRecord, { new: true });
    
    res.clearCookie('token');
    req.flash("success", "Profile updated successfully, Please login again");
    res.redirect('/login');

  } catch (err) {
    return next(err);
  }
}

// Email Verification
const emailVerification = async (req, res, next) => {
  try {
    if (req.params.token) {
      const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
      const user = await User.findById(decoded._id);
      if (user) {
        if (user.isVerified === true) {
          req.flash("error", "Email already verified. Please login.");
          return res.redirect("/login");
        } else {
          user.isVerified = true;
          await user.save({ validateBeforeSave: false });
          req.flash("success", "Email verified successfully. Please login.");
          return res.redirect("/login");
        }
      }
    }else {
      req.flash("error", "Verification link expired");
      return res.redirect("/login");
    }
  } catch (err) {
    return next(err);
  }
}

// Contact Page
const contact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return next(createError("Please fill all fields", 400));
    }
    const mailResponse = await sendMail({
      email: process.env.MY_EMAIL,
      subject: "Contact from FAIRLIOS",
      message: `From: ${name}\n\nEmail: ${email}\n\nMessage: ${message}\n\n\nThis email was sent from contact of FAIRLIOS.`,
    });
    if (mailResponse) {
      const smsResponse = await sendSMS({
        message: `\n\nFrom: ${name}\n\nEmail: ${email}\n\nMessage: ${message}`,
        to: process.env.MY_PHONE_NUMBER,
      });
      if (smsResponse) {
        req.flash("success", "Form submitted successfully. We will get back to you soon.");
      } else {
        req.flash("success", "Form submitted, but SMS notification failed.");
      }
      return res.redirect("/about");

    } else {
      req.flash("error", "Contact form could not be submitted, Please try again.");
      return res.redirect("/about");
    }
  } catch (err) {
    return next(err);
  }
}
module.exports = { registerPage, registerUser, loginPage, loginUser, dashboard, logout, profilePage, updateProfile, emailVerification, contact };

