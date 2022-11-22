const { User } = require("../../models/user/user.model");
const jwt = require("jsonwebtoken");
const httpStatus = require("http-status");
const emailService = require("./email.service");
const localStorage = require("../storage/localStorage.service");
const { ApiError } = require("../../middleware/apiError");
const errors = require("../../config/errors");

module.exports.findUserByEmailOrPhone = async (
  emailOrPhone,
  role = "",
  withError = false
) => {
  try {
    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: { $eq: emailOrPhone } }, { phone: { $eq: emailOrPhone } }],
    });

    // Throwing error if no user found and `throwError = true`
    if (withError && !user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.user.notFound;
      throw new ApiError(statusCode, message);
    }

    // Throwing error if a user was found but the specified `role` does not match
    // This happens in case of role is added as an argument
    // If role is falsy that means this search does not care of role
    if (withError && user && role && user.role !== role) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.user.foundWithInvalidRole;
      throw new ApiError(statusCode, message);
    }

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.findUserById = async (userId) => {
  try {
    return await User.findById(userId);
  } catch (err) {
    throw err;
  }
};

module.exports.validateToken = (token) => {
  try {
    return jwt.verify(token, process.env["JWT_PRIVATE_KEY"]);
  } catch (err) {
    throw err;
  }
};

module.exports.verifyEmailOrPhone = async (key, user, code) => {
  try {
    // Ensure that key is correct
    key = key.toLowerCase();
    if (!["email", "phone"].includes(key)) {
      key = "email";
    }

    // Check if user's email or phone is verified
    const isVerified =
      key === "email" ? user.isEmailVerified() : user.isPhoneVerified();
    if (isVerified) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user[`${key}AlreadyVerified`];
      throw new ApiError(statusCode, message);
    }

    // Check if code is correct
    const isCorrectCode = user.isMatchingCode(`${key}VerificationCode`, code);
    if (!isCorrectCode) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.incorrectCode;
      throw new ApiError(statusCode, message);
    }

    // Check if code is expired
    const isValidCode = user.isValidCode(`${key}VerificationCode`);
    if (!isValidCode) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.expiredCode;
      throw new ApiError(statusCode, message);
    }

    // Verify user's email or phone
    if (key === "email") {
      user.verifyEmail();
    } else {
      user.verifyPhone();
    }

    return await user.save();
  } catch (err) {
    throw err;
  }
};

module.exports.resendEmailOrPhoneVerificationCode = async (key, user, lang) => {
  try {
    // Ensure that key is correct
    key = key.toLowerCase();
    if (!["email", "phone"].includes(key)) {
      key = "email";
    }

    // Check if user's email or phone is verified
    const isVerified =
      key === "email" ? user.isEmailVerified() : user.isPhoneVerified();
    if (isVerified) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user[`${key}AlreadyVerified`];
      throw new ApiError(statusCode, message);
    }

    // Update user's email or phone verification code
    // Send code in a message to user's email or phone
    // Save user
    if (key === "email") user.updateEmailVerificationCode();
    else user.updatePhoneVerificationCode();
    await user.save();

    // Sending email or phone verification code to user's email or phone
    if (key === "email")
      await emailService.registerEmail(lang, user.email, user);

    // TODO: send phone verification code to user's phone
  } catch (err) {
    throw err;
  }
};

module.exports.changePassword = async (user, oldPassword, newPassword) => {
  try {
    // Decoding user's password and comparing it with the old password
    if (!(await user.comparePassword(oldPassword))) {
      const statusCode = httpStatus.UNAUTHORIZED;
      const message = errors.auth.incorrectOldPassword;
      throw new ApiError(statusCode, message);
    }

    // Update password
    await user.updatePassword(newPassword);

    await user.save();
  } catch (err) {
    throw err;
  }
};

module.exports.sendForgotPasswordCode = async (emailOrPhone, sendTo, lang) => {
  try {
    // Check if user exists
    const user = await this.findUserByEmailOrPhone(emailOrPhone);
    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.auth.emailOrPhoneNotUsed;
      throw new ApiError(statusCode, message);
    }

    // Update password reset code
    user.generatePasswordResetCode();
    const updatedUser = await user.save();

    // Send password reset code to phone or
    if (sendTo === "phone") {
      // TODO: send forgot password code to user's phone.
    } else {
      await emailService.forgotPasswordEmail(lang, user.email, updatedUser);
    }
  } catch (err) {
    throw err;
  }
};

module.exports.resetPasswordWithCode = async (
  emailOrPhone,
  code,
  newPassword
) => {
  try {
    // Check if user exists
    const user = await this.findUserByEmailOrPhone(emailOrPhone);
    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.auth.emailNotUsed;
      throw new ApiError(statusCode, message);
    }

    // Check if code is correct
    const isCorrectCode = user.isMatchingCode("resetPasswordCode", code);
    if (!isCorrectCode) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.incorrectCode;
      throw new ApiError(statusCode, message);
    }

    // Check if code is expired
    const isValidCode = user.isValidCode("resetPasswordCode");
    if (!isValidCode) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.expiredCode;
      throw new ApiError(statusCode, message);
    }

    // Update password
    await user.updatePassword(newPassword);

    return await user.save();
  } catch (err) {
    throw err;
  }
};

module.exports.updateProfile = async (
  lang,
  user,
  name,
  email,
  password,
  phone,
  avatar
) => {
  try {
    const body = {
      lang,
      name,
      email,
      password,
      phone,
      avatar,
    };

    return await updateUserProfile(user, body);
  } catch (err) {
    throw err;
  }
};

///////////////////////////// ADMIN /////////////////////////////
module.exports.changeUserRole = async (emailOrPhone, role) => {
  try {
    // Check if user exists
    const user = await this.findUserByEmailOrPhone(emailOrPhone);
    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.user.notFound;
      throw new ApiError(statusCode, message);
    }

    // Update user's role
    user.role = role;

    return await user.save();
  } catch (err) {
    throw err;
  }
};

module.exports.verifyUser = async (emailOrPhone) => {
  try {
    // Check if used exists
    const user = await this.findUserByEmailOrPhone(emailOrPhone);
    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.user.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if user's email and phone are already verified
    if (user.verified.email && user.verified.phone) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user.alreadyVerified;
      throw new ApiError(statusCode, message);
    }

    // Verify user's email and phone
    user.verifyEmail();
    user.verifyPhone();

    return await user.save();
  } catch (err) {
    throw err;
  }
};

module.exports.updateUserProfile = async (
  lang,
  emailOrPhone,
  name,
  email,
  password,
  phone,
  avatar
) => {
  try {
    // Checking if user exists
    const user = await this.findUserByEmailOrPhone(emailOrPhone);
    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.user.notFound;
      throw new ApiError(statusCode, message);
    }

    const body = {
      lang,
      name,
      email,
      password,
      phone,
      avatar,
    };

    return await updateUserProfile(user, body);
  } catch (err) {
    throw err;
  }
};

const updateUserProfile = async (user, body) => {
  try {
    const { name, avatar, password, email, phone, lang } = body;

    // To detect updates
    let userChanged = false;

    // Updating name when there's new name
    if (name && user.name !== name) {
      user.name = name;
      userChanged = true;
    }

    // Updating avatar when there's new avatar
    if (avatar) {
      const file = await localStorage.storeFile(avatar);
      await localStorage.deleteFile(user.avatarURL);
      user.avatarURL = file.path;
      userChanged = true;
    }

    // Updating password when there's new password
    if (password) {
      await user.updatePassword(password);
      userChanged = true;
    }

    // Updating email, setting email as not verified,
    // update email verification code, and sending
    // email verification code to user's email
    if (email && user.email !== email) {
      // Checking if email used
      const emailUsed = await this.findUserByEmailOrPhone(email);
      if (emailUsed) {
        const statusCode = httpStatus.NOT_FOUND;
        const message = errors.auth.emailOrPhoneUsed;
        throw new ApiError(statusCode, message);
      }

      // Updating email, setting email as not verified,
      // update email verification code, and sending
      // email verification code to user's email
      user.email = email;
      user.verified.email = false;
      userChanged = true;
      user.updateEmailVerificationCode();
      await emailService.changeEmail(lang, email, user);
    }

    // Updating phone, setting phone as not verified,
    // update phone verification code, and sending
    // phone verification code to user's phone
    if (phone && user.phone !== phone) {
      // Checking if phone used
      const phoneUsed = await this.findUserByEmailOrPhone(phone);
      if (phoneUsed) {
        const statusCode = httpStatus.NOT_FOUND;
        const message = errors.auth.emailOrPhoneUsed;
        throw new ApiError(statusCode, message);
      }

      // Updating email, setting email as not verified,
      // update email verification code, and sending
      // email verification code to user's email
      user.phone = phone;
      user.verified.phone = false;
      userChanged = true;
      user.updatePhoneVerificationCode();

      // TODO: send phone verification code to user's email.
    }

    return userChanged ? await user.save() : user;
  } catch (err) {
    throw err;
  }
};
