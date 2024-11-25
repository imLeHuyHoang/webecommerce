// models/Attribute.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AttributeSchema = new Schema({
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  key: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["String", "Number", "Boolean"],
  },
});

module.exports = mongoose.model("Attribute", AttributeSchema);
