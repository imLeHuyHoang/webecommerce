// scripts/initTokenVersion.js
const mongoose = require("mongoose");
const User = require("../models/User"); // Điều chỉnh đường dẫn nếu cần

mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const initializeTokenVersion = async () => {
  try {
    const users = await User.find({ tokenVersion: { $exists: false } });
    for (let user of users) {
      user.tokenVersion = 0;
      await user.save();
      console.log(`Updated user ${user.email} with tokenVersion=0`);
    }
    console.log("Initialization complete.");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error initializing tokenVersion:", error);
    mongoose.connection.close();
  }
};

initializeTokenVersion();
