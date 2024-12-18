// models/ShopComment.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const ShopCommentSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      maxlength: 500,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShopComment", ShopCommentSchema);
