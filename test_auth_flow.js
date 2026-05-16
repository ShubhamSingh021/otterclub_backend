import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "./src/models/User.js";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

const testAuthFlow = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("TEST: Connected to database.");

    const email = `test_${Date.now()}@example.com`;
    const password = "password123";
    const newPassword = "newpassword123";

    // 1. Create user
    console.log(`TEST: Creating user ${email}...`);
    const user = await User.create({
      name: "Test User",
      email,
      password,
    });
    console.log("TEST: User created.");

    // 2. Trigger forgot password logic (simulated)
    console.log("TEST: Generating reset token...");
    const resetToken = user.getResetPasswordToken();
    await user.save();
    console.log(`TEST: Reset token generated: ${resetToken}`);

    // 3. Reset password
    console.log("TEST: Resetting password...");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const resetUser = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!resetUser) {
      throw new Error("Reset user not found or token expired");
    }

    resetUser.password = newPassword;
    resetUser.resetPasswordToken = undefined;
    resetUser.resetPasswordExpire = undefined;
    await resetUser.save();
    console.log("TEST: Password reset successful.");

    // 4. Verify login with new password
    console.log("TEST: Verifying login with new password...");
    const loginUser = await User.findOne({ email }).select("+password");
    const isMatch = await loginUser.matchPassword(newPassword);
    
    if (isMatch) {
      console.log("TEST SUCCESS: Auth flow works perfectly!");
    } else {
      console.error("TEST FAILED: New password does not match!");
    }

    // Cleanup
    await User.deleteOne({ _id: user._id });
    console.log("TEST: Cleanup done.");

    await mongoose.disconnect();
  } catch (error) {
    console.error("TEST_ERROR:", error);
    process.exit(1);
  }
};

testAuthFlow();
