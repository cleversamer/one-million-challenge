const { User } = require("../models/user/user.model");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");

const jwtOptions = {
  secretOrKey: process.env["JWT_PRIVATE_KEY"],
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    const user = await User.findById(payload.sub);

    // Check if user exists
    if (!user) {
      return done(null, false);
    }

    // Check if password is correct
    // Decoding user's password and comparing it with the old password
    if (payload.password !== user.password) {
      return done(null, false);
    }

    done(null, user);
  } catch (err) {
    done(err, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};
