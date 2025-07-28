import { mongoose, Schema } from "mongoose";

const useGoogle = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: Number,
      
    },
  },
  {
    timestamps: true,
  }
);


export const Google= mongoose.model("Google",useGoogle);
