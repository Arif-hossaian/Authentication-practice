import express from "express";
import { uploadAvatar } from "../controller/uploadCtrl.js";
import uploadImage from "../middlewares/uploadImage.js";
import auth from "../middlewares/auth.js"
const router = express.Router();

router.post("/upload_avatar", uploadImage, auth, uploadAvatar);

export default router;
