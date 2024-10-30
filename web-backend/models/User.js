const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  province: String,
  district: String,
  ward: String,
  street: String,
  default: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    default: "other",
  },
  roles: { type: [String], enum: ["user", "admin"], default: ["user"] },
  isActive: { type: Boolean, default: true },
  addresses: [addressSchema],
  lastLogin: { type: Date, default: Date.now },
  refreshToken: { type: String, default: null },
});

module.exports = mongoose.model("User", userSchema);
