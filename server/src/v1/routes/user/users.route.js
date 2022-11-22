const router = require("express").Router();
const { usersController } = require("../../controllers");
const { authValidator, userValidator } = require("../../middleware/validation");
const auth = require("../../middleware/auth");

router.get("/isauth", auth("readOwn", "user", true), usersController.isAuth);

router
  .route("/verify-email")
  .get(
    auth("readOwn", "emailVerificationCode", true),
    authValidator.resendCodeValidator,
    usersController.resendEmailOrPhoneVerificationCode("email")
  )
  .post(
    auth("updateOwn", "emailVerificationCode", true),
    authValidator.codeValidator,
    usersController.verifyEmailOrPhone("email")
  );

router
  .route("/verify-phone")
  .get(
    auth("readOwn", "phoneVerificationCode", true),
    authValidator.resendCodeValidator,
    usersController.resendEmailOrPhoneVerificationCode("phone")
  )
  .post(
    auth("updateOwn", "phoneVerificationCode", true),
    authValidator.codeValidator,
    usersController.verifyEmailOrPhone("phone")
  );

router
  .route("/forgot-password")
  .get(
    authValidator.getForgotPasswordCode,
    usersController.sendForgotPasswordCode
  )
  .post(
    authValidator.forgotPasswordValidator,
    usersController.handleForgotPassword
  );

router.patch(
  "/change-password",
  auth("updateOwn", "password"),
  authValidator.changePasswordValidator,
  usersController.changePassword
);

router.patch(
  "/update",
  auth("updateOwn", "user"),
  userValidator.validateUpdateProfile,
  usersController.updateProfile
);

////////////// ADMIN APIs //////////////
router.patch(
  "/admin/update-profile",
  auth("updateAny", "user"),
  userValidator.validateUpdateUserProfile,
  usersController.updateUserProfile
);

router.patch(
  "/admin/change-user-role",
  auth("updateAny", "user"),
  userValidator.validateUpdateUserRole,
  usersController.changeUserRole
);

router.patch(
  "/admin/verify-user",
  auth("updateAny", "user"),
  userValidator.validateVerifyUser,
  usersController.verifyUser
);

router.get(
  "/:role/:id",
  auth("readAny", "user"),
  userValidator.validateFindUserByEmailOrPhone,
  usersController.findUserByEmailOrPhone
);

module.exports = router;
