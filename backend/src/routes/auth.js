const express = require("express");
const passport = require("passport");

const router = express.Router();

const { FRONTEND_URL = "http://localhost:3000" } = process.env;

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${FRONTEND_URL}?login=failed`,
  }),
  (_req, res) => {
    res.redirect(FRONTEND_URL);
  }
);

router.post("/logout", (req, res) => {
  req.logout((error) => {
    if (error) {
      return res.status(500).json({ message: "Logout failed" });
    }
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });
});

module.exports = router;
