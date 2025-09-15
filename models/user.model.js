const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const paginate = require('mongoose-paginate-v2');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '❌ Please add your full name'],
    trim: true,
    minlength: [2, '❌ Name must be at least 2 characters long'],
    maxlength: [25, '❌ Name must be at most 25 characters long'],
    match: [/^[A-Za-z\s]+$/, "❌ Name can contain alphabets only"], // alphabets & spaces only
  },
  email: {
    type: String,
    required: [ true, '❌ Please add an email'],
    unique: [ true, '❌ Email already exists'],
    match: [/.+\@.+\..+/, "❌ Please enter a valid email"],
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: [ true, '❌ Please add a password'],
    minlength: [ 4, '❌ Password must be at least 4 characters long'],
    maxlength: [ 15, '❌ Password must be at most 15 characters long'],
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });


// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.plugin(paginate);
module.exports = mongoose.model('User', userSchema);

// Delete 2 hours (7200 seconds) after creation if not verified
userSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7200, partialFilterExpression: { isVerified: false } });