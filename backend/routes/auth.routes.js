const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/register", authController.register);
router.post("/register-company", authController.registerCompany);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);

module.exports = router;