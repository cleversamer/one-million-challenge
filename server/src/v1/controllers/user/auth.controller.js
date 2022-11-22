const { authService, emailService } = require("../../services");
const httpStatus = require("http-status");
const { CLIENT_SCHEMA } = require("../../models/user/user.model");
const _ = require("lodash");

module.exports.register = async (req, res, next) => {
  try {
    const { lang, name, email, phone, password, role } = req.body;

    const user = await authService.register(email, password, name, phone, role);

    await emailService.registerEmail(lang, email, user);

    // TODO: send phone activation code to user's phone.

    const response = {
      user: _.pick(user, CLIENT_SCHEMA),
      token: user.genAuthToken(),
    };

    res.status(httpStatus.CREATED).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { emailOrPhone, password } = req.body;

    const user = await authService.login(emailOrPhone, password);

    const response = {
      user: _.pick(user, CLIENT_SCHEMA),
      token: user.genAuthToken(),
    };

    res.status(httpStatus.OK).json(response);
  } catch (err) {
    next(err);
  }
};
