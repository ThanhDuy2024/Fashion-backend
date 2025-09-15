import mongoose from "mongoose";
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);
const { Schema } = mongoose;

const schema = new Schema({
  userId: {
    type: String,
    require: true
  },
  address: {
    type: String,
    require: true
  },
  phone: {
    type: String,
    require: true
  },
  orderList: {
    type: Array,
    require: true,
  },
  coupon: {
    type: String,
    require: true
  },
  discount: {
    type: String,
  },
  totalOrder: {
    type: Number,
    default: 1,
  },
  totalAfterDiscount: {
    type: Number,
    default: 1
  },
  paymentStatus: {
    type: String,
    default: "unpaid",
    enum: ["paid", "unpaid"]
  },
  paymentMethod: {
    type: String,
    default: "offline",
    enum: ["offline", "zalopay"]
  },
  status: {
    type: String,
    default: "init",
    enum: ["init", "InTransit", "complete"]
  },
  deletedBy: String,
  deleted: {
    type: Boolean,
    default: false
  },
  slug: {
    type: String,
    slug: "name",
    unique: true
  }
}, {
  timestamps: true
});

export const Order = mongoose.model("Order", schema, "order");