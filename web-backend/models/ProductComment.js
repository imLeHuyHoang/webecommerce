const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductCommentSchema = new Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductComment",
      default: null,
    },
    isAdminResponse: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Virtual field for replies
ProductCommentSchema.virtual("replies", {
  ref: "ProductComment",
  localField: "_id",
  foreignField: "parentComment",
});

// Ensure virtual fields are serialized
ProductCommentSchema.set("toObject", { virtuals: true });
ProductCommentSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("ProductComment", ProductCommentSchema);
