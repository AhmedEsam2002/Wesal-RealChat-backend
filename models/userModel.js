import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email",
    ],
    index: true, // <<< مهم لإجبار التحقق
  },
  password: { type: String, required: true, select: false, minlength: 8 },
  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // Only works on .save() or .create()
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords do not match",
    },
    select: false,
  },
  avatar: { type: String, default: "" },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  passwordChangedAt: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  active: { type: Boolean, default: true, select: false },
  online: { type: Boolean, default: false },
});
// ----------Hasing Password----------
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;

  next();
});
// ----------Set Change password time-------
userSchema.pre("save", function (next) {
  if (this.isModified("password") && !this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // Ensure the timestamp is before the JWT issued time
  }
  next();
});
// ----------Query Middleware----------
// This middleware will exclude inactive users from query results
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// --------- METHODS -----------
// 1-Validate Password
userSchema.methods.isCorrectPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false; // Password not changed
};

// 2-Check if password changed after token issued
userSchema.methods.isJWTStillValid = function (tokenIssuedAt) {
  return !this.changedPasswordAfter(tokenIssuedAt);
};

// 3-Generate Password Reset Token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};
// 4-Check if Password Reset Token is Valid
userSchema.methods.isValidPasswordResetToken = function (token) {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  return (
    this.passwordResetToken === hashedToken &&
    this.passwordResetExpires > Date.now()
  );
};

const User = model("User", userSchema);
export default User;
