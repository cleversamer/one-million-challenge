const { User } = require("../../models/user/user.model");
const bcrypt = require("bcrypt");
const { ApiError } = require("../../middleware/apiError");
const httpStatus = require("http-status");
const errors = require("../../config/errors");
const usersService = require("./users.service");

module.exports.register = async (email, password, name, phone, role) => {
  try {
    // Hashing password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Creating user instance
    const user = new User({
      name,
      email,
      password: hashed,
      phone,
      role,
    });

    // Updating verification codes to be sent to the user
    user.updateEmailVerificationCode();
    user.updatePhoneVerificationCode();

    return await user.save();
  } catch (err) {
    if (err.code === errors.codes.duplicateIndexKey) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.emailOrPhoneUsed;
      err = new ApiError(statusCode, message);
    }

    throw err;
  }
};

module.exports.login = async (email, password) => {
  try {
    const user = await usersService.findUserByEmailOrPhone(email);

    // Check if user exist
    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.auth.incorrectCredentials;
      throw new ApiError(statusCode, message);
    }

    // Decoding user's password and comparing it with the password argument
    if (!(await user.comparePassword(password))) {
      const statusCode = httpStatus.UNAUTHORIZED;
      const message = errors.auth.incorrectCredentials;
      throw new ApiError(statusCode, message);
    }

    user.updateLastLogin();

    return await user.save();
  } catch (err) {
    throw err;
  }
};
