const httpStatus = require("http-status");
const _ = require("lodash");
const { CLIENT_SCHEMA } = require("../../models/user/user.model");
const { usersService } = require("../../services");
const success = require("../../config/success");

module.exports.isAuth = async (req, res, next) => {
  try {
    req.user.updateLastLogin();
    const user = await req.user.save();

    res.status(httpStatus.OK).json(_.pick(user, CLIENT_SCHEMA));
  } catch (err) {
    next(err);
  }
};

module.exports.verifyEmailOrPhone = (key) => async (req, res, next) => {
  try {
    const user = req.user;
    const { code } = req.body;

    const verifiedUser = await usersService.verifyEmailOrPhone(key, user, code);

    res.status(httpStatus.OK).json(_.pick(verifiedUser, CLIENT_SCHEMA));
  } catch (err) {
    next(err);
  }
};

module.exports.resendEmailOrPhoneVerificationCode =
  (key) => async (req, res, next) => {
    try {
      const user = req.user;
      const { lang } = req.query;

      await usersService.resendEmailOrPhoneVerificationCode(key, user, lang);

      const response = {
        ok: true,
        message: success.auth[`${key}VerificationCodeSent`],
      };

      res.status(httpStatus.OK).json(response);
    } catch (err) {
      next(err);
    }
  };

module.exports.changePassword = async (req, res, next) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;

    await usersService.changePassword(user, oldPassword, newPassword);

    const response = {
      user: _.pick(user, CLIENT_SCHEMA),
      token: user.genAuthToken(),
    };

    res.status(httpStatus.CREATED).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.sendForgotPasswordCode = async (req, res, next) => {
  try {
    const { emailOrPhone, sendTo, lang } = req.query;

    await usersService.sendForgotPasswordCode(emailOrPhone, sendTo, lang);

    const response = {
      ok: true,
      message:
        sendTo === "phone"
          ? success.auth.passwordResetCodeSentToPhone
          : success.auth.passwordResetCodeSentToEmail,
    };

    res.status(httpStatus.OK).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.handleForgotPassword = async (req, res, next) => {
  try {
    const { emailOrPhone, code, newPassword } = req.body;

    const user = await usersService.resetPasswordWithCode(
      emailOrPhone,
      code,
      newPassword
    );

    res.status(httpStatus.OK).json(_.pick(user, CLIENT_SCHEMA));
  } catch (err) {
    next(err);
  }
};

module.exports.updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const { name, email, phone, password, lang } = req.body;
    const avatar = req?.files?.avatar || null;

    const updatedUser = await usersService.updateProfile(
      lang,
      user,
      name,
      email,
      password,
      phone,
      avatar
    );

    const response = {
      user: _.pick(updatedUser, CLIENT_SCHEMA),
      token: updatedUser.genAuthToken(),
    };

    res.status(httpStatus.CREATED).json(response);
  } catch (err) {
    next(err);
  }
};

///////////////////////////// ADMIN /////////////////////////////
module.exports.updateUserProfile = async (req, res, next) => {
  try {
    const {
      lang = "ar",
      emailOrPhone,
      name,
      email,
      password,
      phone,
    } = req.body;
    const avatar = req?.files?.avatar || null;

    const updatedUser = await usersService.updateUserProfile(
      lang,
      emailOrPhone,
      name,
      email,
      password,
      phone,
      avatar
    );

    res.status(httpStatus.CREATED).json(_.pick(updatedUser, CLIENT_SCHEMA));
  } catch (err) {
    next(err);
  }
};

module.exports.verifyUser = async (req, res, next) => {
  try {
    const { emailOrPhone } = req.body;

    const updatedUser = await usersService.verifyUser(emailOrPhone);

    res.status(httpStatus.CREATED).json(_.pick(updatedUser, CLIENT_SCHEMA));
  } catch (err) {
    next(err);
  }
};

module.exports.changeUserRole = async (req, res, next) => {
  try {
    const { emailOrPhone, role } = req.body;

    const updatedUser = await usersService.changeUserRole(emailOrPhone, role);

    res.status(httpStatus.CREATED).json(_.pick(updatedUser, CLIENT_SCHEMA));
  } catch (err) {
    next(err);
  }
};

module.exports.findUserByEmailOrPhone = async (req, res, next) => {
  try {
    const { role, id: emailOrPhone } = req.params;

    const user = await usersService.findUserByEmailOrPhone(
      emailOrPhone,
      role,
      true
    );

    res.status(httpStatus.OK).json(_.pick(user, CLIENT_SCHEMA));
  } catch (err) {
    next(err);
  }
};
