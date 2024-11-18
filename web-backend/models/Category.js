const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    images: {
      type: [String],
    },
    descriptions: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true } // Thay thế createAt và updateAt
);

module.exports = mongoose.model("Category", CategorySchema);
