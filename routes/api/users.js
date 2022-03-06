const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
// @route   POST api/users
// @desc    Register User
// @access  Public
router.post(
  "/",
  [
    check("name", "Name is Required").not().isEmpty(),
    check("email", "Please Add a Valid Email").isEmail(),
    check(
      "password",
      "Please Enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // console.log(req.body);
      return res.status(400).json({ errors: errors.array() });
    }
    // Check if User Exists
    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email }).lean();
      console.log(user);

      if (user) {
        return res.status(400).json({ errors: [{ message: "User Exists" }] });
      }
      // Get Gravatars
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });
      // Encrypt Passwords
      const salt = await bcrypt.genSalt(10);

      user = new User({
        name,
        email,
        avatar,
        password,
      });
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      // Return jsonwebtoken

      res.send("User Registered");
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
