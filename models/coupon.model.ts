import mongoose from "mongoose";
const slug = require('mongoose-slug-updater');
const { Schema } = mongoose;
mongoose.plugin(slug);

const schema = new Schema({
  name: String,
  discount: Number,
  startDate: Date,
  endDate: Date,
  expireAt: {
    type: Date,
    expires: 0
  },
  status: {
    type: String,
    default: "active"
  },
  createdBy: String,
  updatedBy: String,
  slug: {
    type: String,
    slug: "name",
    unique: true
  }
}, {
  timestamps: true
})

export const Coupon = mongoose.model("Coupon", schema, "coupons");
