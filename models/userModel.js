const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name."],
    min: [3, "Your name must be greater than 3 characters."],
    max: [20, "Your name must be lesser than 20 characters."],
  },
  email: {
    type: String,
    required: [true, "Please enter your email address."],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email address."],
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Please enter your password."],
    minLength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password."],
    validate: {
      // This only works for .save() , .create() and won't work for find
      validator: function (value) {
        return value === this.password;
      },
      message: "Password and confirm password do not match.",
    },
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = null;
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
