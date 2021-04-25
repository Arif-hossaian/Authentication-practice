import express from "express";
const router = express.Router();
import {
  activateEmail,
  deletUser,
  facebookLogin,
  forgotPassword,
  getAccessToken,
  getUserAllInfor,
  getUserInfo,
  googleLogin,
  login,
  logout,
  register,
  resetPassword,
  updateUser,
  updateUserRole,
} from "../controller/userCtrl.js";
import auth from "../middlewares/auth.js";
import authAdmin from "../middlewares/authAdmin.js";

router.post("/register", register);

router.post("/activation", activateEmail);

router.post("/login", login);

router.post("/refresh_token", getAccessToken);

router.post("/forgot", forgotPassword);

router.post("/reset", auth, resetPassword);

router.get("/infor", auth, getUserInfo);

router.get("/all_infor", auth, authAdmin, getUserAllInfor);

router.get("/logout", logout);

router.patch("/update", auth, updateUser);

router.patch("/update_role/:id", auth, authAdmin, updateUserRole);

router.delete("/delete/:id", auth, authAdmin, deletUser);

//social login
router.post("/google_login", googleLogin);

router.post("/facebook_login", facebookLogin);

export default router;
