import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Google } from "../models/usergoogle.models.js";
import jwt from 'jsonwebtoken';

const googleLogin = asyncHandler(async (req, res) => {
  const { name, email, phoneNumber } = req.body;

  if ([name, email, phoneNumber].some(field => field?.trim() === "")) {
    throw new ApiError(401, "Please give all credentials");
  }

  let user = await Google.findOne({ email });

  if (!user) {
    const newUser = await Google.create({ name, email, phoneNumber });
    user = newUser;
  }

  const payload = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.cookie('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600000,
  });

  res.status(200).json(new ApiResponse(200, user, "User logged in successfully"));
});

export { googleLogin };
