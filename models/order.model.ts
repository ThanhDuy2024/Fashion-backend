import mongoose from "mongoose";
const { Schema } = mongoose;

const schema = new Schema({
  userId: {
    type: String,
  },
  email: String,
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
  orderList: {
    type: Array,
  },
  coupon: {
    type: String,
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
    enum: ["offline", "bank"]
  },
  status: {
    type: String,
    default: "init",
    enum: ["init", "inTransit", "complete"]
  },
  deletedBy: String,
  updatedBy: String,
  deleted: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true
});

export const Order = mongoose.model("Order", schema, "order");