const express = require("express");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const upload = require("express-fileupload");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");

// The following configuration will limit the number of requests
// to 500 requests per minute for an IP address.
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 1 request per second
  message: {
    status: "error",
    statusCode: 403,
    message: {
      en: "Too many requests, please try again later",
      ar: "تم حظر آي بي جهازك من إستخدام التطبيق لمدة من الوقت",
    },
  },
});

module.exports = (app) => {
  app.use(limiter);
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("uploads"));
  app.use(helmet());
  app.use(cors({ origin: true }));
  app.use(upload());
  app.use(xss());
  app.use(mongoSanitize());
};
