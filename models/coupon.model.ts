import mongoose from "mongoose";
const slug = require('mongoose-slug-updater');
const { Schema } = mongoose;
mongoose.plugin(slug);

const schema = new Schema({
  name: String,
  discount: Number,
  expireAt: Date,
  deleted: {
    type: Boolean,
    default: false
  },
  createdBy: String,
  updatedBy: String,
  slug: {
    type: String,
    slug: "name",
    unique: true
  }
})

export const Coupon = mongoose.model("Coupon", schema, "coupons");
