const mongoose = require("mongoose");
const { SUPPORTED_ROLES } = require("../../models/user/user.model");
const { check, validationResult } = require("express-validator");
const httpStatus = require("http-status");
const { ApiError } = require("../apiError");
const errors = require("../../config/errors");

const next = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const statusCode = httpStatus.BAD_REQUEST;
    const message = errors.array()[0].msg;
    const err = new ApiError(statusCode, message);
    return next(err);
  }

  next();
};

const checkEmailOrPhone = [
  (req, res, next) => {
    req.body.emailOrPhone = req.body?.emailOrPhone?.toLowerCase();
    next();
  },

  check("emailOrPhone")
    .isLength({ min: 8, max: 256 })
    .withMessage(errors.auth.invalidEmailOrPhone)
    .bail(),
];

const checkEmail = [
  (req, res, next) => {
    req.body.email = req.body?.email?.toLowerCase();
    next();
  },

  check("email").isEmail().withMessage(errors.auth.invalidEmail).bail(),

  next,
];

const checkPassword = check("password")
  .isLength({ min: 8, max: 32 })
  .withMessage(errors.auth.invalidPassword);

const checkOldPassword = check("oldPassword")
  .isLength({ min: 8, max: 32 })
  .withMessage(errors.auth.invalidPassword);

const checkNewPassword = check("newPassword")
  .isLength({ min: 8, max: 32 })
  .withMessage(errors.auth.invalidPassword);

const checkCode = check("code")
  .isLength({ min: 4, max: 4 })
  .isNumeric()
  .withMessage(errors.auth.invalidCode);

const checkLanguage = check("lang")
  .notEmpty()
  .withMessage(errors.user.noLanguage)
  .isIn(["en", "ar"])
  .withMessage(errors.user.unsupportedLanguage);

const checkName = check("name")
  .isLength({ min: 8, max: 64 })
  .withMessage(errors.auth.invalidName);

const checkRole = (exceptAdmin = false) =>
  exceptAdmin
    ? check("role")
        .isIn(SUPPORTED_ROLES.filter((role) => role !== "admin"))
        .withMessage(errors.user.invalidRole)
    : check("role").isIn(SUPPORTED_ROLES).withMessage(errors.user.invalidRole);

const checkPhone = (req, res, next) => {
  let { phone } = req.body;

  // Convert phone to string if it's not a string.
  if (typeof phone !== "string") {
    phone = String(phone);
  }

  // Check phone length (should = 10).
  if (phone.length !== 10) {
    const statusCode = httpStatus.BAD_REQUEST;
    const message = errors.auth.invalidPhone;
    const err = new ApiError(statusCode, message);
    return next(err);
  }

  // Check if it starts with 059 or 056
  if (!phone.startsWith("059") && !phone.startsWith("056")) {
    const statusCode = httpStatus.BAD_REQUEST;
    const message = errors.auth.invalidPhone;
    const err = new ApiError(statusCode, message);
    return next(err);
  }

  next();
};

const checkMongoIdQueryParam = (req, res, next) => {
  const emptyQueryParams = !Object.keys(req.query).length;
  if (emptyQueryParams) {
    const statusCode = httpStatus.BAD_REQUEST;
    const message = errors.data.noMongoId;
    const err = new ApiError(statusCode, message);
    return next(err);
  }

  for (let item in req.query) {
    if (!mongoose.isValidObjectId(req.query[item])) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.data.invalidMongoId;
      const err = new ApiError(statusCode, message);
      return next(err);
    }
  }

  next();
};

const checkMongoIdParam = (req, res, next) => {
  const emptyParams = !Object.keys(req.params).length;
  if (emptyParams) {
    const statusCode = httpStatus.BAD_REQUEST;
    const message = errors.data.noMongoId;
    const err = new ApiError(statusCode, message);
    return next(err);
  }

  for (let item in req.params) {
    if (!mongoose.isValidObjectId(req.params[item])) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.data.invalidMongoId;
      const err = new ApiError(statusCode, message);
      return next(err);
    }
  }

  next();
};

const conditionalCheck = (key, checker) => (req, res, next) => {
  return req.body[key] ? checker(req, res, next) : next();
};

const checkFile =
  (key, supportedTypes, compulsory = true) =>
  (req, res, next) => {
    if (!compulsory && (!req.files || !req.files[key])) {
      return next();
    }

    if (compulsory && (!req.files || !req.files[key])) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.system.noPhoto;
      const err = new ApiError(statusCode, message);
      return next(err);
    }

    const fileType = req.files[key].name.split(".")[1];
    if (!supportedTypes.includes(fileType)) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.system.invalidExtension;
      const err = new ApiError(statusCode, message);
      return next(err);
    }

    next();
  };

module.exports = {
  next,
  checkPhone,
  checkMongoIdQueryParam,
  conditionalCheck,
  checkFile,
  checkMongoIdParam,
  checkEmailOrPhone,
  checkEmail,
  checkPassword,
  checkOldPassword,
  checkNewPassword,
  checkCode,
  checkLanguage,
  checkName,
  checkRole,
};
