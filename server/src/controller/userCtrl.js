import Users from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "dotenv";
import sendMail from "../controller/sendMail.js";
import {google} from "googleapis"
const {OAuth2} = google.auth
import fetch from "node-fetch"
const client = new OAuth2(process.env.MAILING_SERVICE_CLIENT_ID)

env.config();

const { CLIENT_URL } = process.env;

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ msg: "Please fill in all fields." });

    if (!validateEmail(email))
      return res.status(400).json({ msg: "Invalid emails." });

    const user = await Users.findOne({ email });
    if (user)
      return res.status(400).json({ msg: "This email already exists." });

    if (password.length < 6)
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters." });

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = {
      name,
      email,
      password: passwordHash,
    };

    const activation_token = createActivationToken(newUser);

    const url = `${CLIENT_URL}/user/activate/${activation_token}`;
    sendMail(email, url, "Verify your email address");

    res.json({
      msg: "Register Success! Please activate your email to start.",
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const activateEmail = async (req, res) => {
  try {
    const { activation_token } = req.body;
    const user = jwt.verify(
      activation_token,
      process.env.ACTIVATION_TOKEN_SECRET
    );
    console.log(user);

    const { name, email, password } = user;
    const check = await Users.findOne({ email });

    if (check)
      return res.status(400).json({ msg: "This email is already exists." });

    const newUser = new Users({
      name,
      email,
      password,
    });

    await newUser.save();

    res.json({ msg: "Account has been activated!" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "This email does not exits." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials." });

    const refresh_token = createRefreshToken({ id: user._id });
    res.cookie("refreshtoken", refresh_token, {
      httpOnly: true,
      path: "/user/refresh_token",
      maxAge: 7 * 24 * 60 * 60 * 1000, // means 7 day in milisecond formate
    });

    res.json({ msg: "Login Success😊" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

export const getAccessToken = async (req, res) => {
  try {
    const rf_token = req.cookies.refreshtoken;
    if (!rf_token) return res.status(400).json({ msg: "Please login now!!" });

    jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.status(400).json({ msg: "Please login now!!" });

      const access_token = createAccessToken({ id: user.id });
      res.json({ access_token });
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Users.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "This email does not exists." });

    const access_token = createAccessToken({ id: user._id });
    const url = `${CLIENT_URL}/user/reset/${access_token}`;

    sendMail(email, url, "Reset your password");
    res.json({ msg: "Re-send the password, please check your email." });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const passwordHash = await bcrypt.hash(password, 12);

    await Users.findOneAndUpdate(
      { _id: req.user.id },
      {
        password: passwordHash,
      }
    );

    res.json({ msg: "Password successfully changed!" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const user = await Users.findById(req.user.id).select("-password");

    res.json(user);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const getUserAllInfor = async (req, res) => {
  try {
    const users = await Users.find().select("-password");

    res.json(users);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("refreshtoken", { path: "/user/refresh_token" });
    return res.json({ msg: "Logged out." });
  } catch (error) {
    return res.status(500).json({ msg: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    await Users.findOneAndUpdate(
      { _id: req.user.id },
      {
        name,
        avatar,
      }
    );

    res.json({ msg: "Update Success!" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    await Users.findOneAndUpdate(
      { _id: req.params.id },
      {
        role,
      }
    );

    res.json({ msg: "Update Success!" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const deletUser = async (req, res) => {
  try {
    await Users.findByIdAndDelete(req.params.id);

    res.json({ msg: "Deleted Success!" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;

    const verify = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.MAILING_SERVICE_CLIENT_ID,
    });

    const { email_verified, email, name, picture } = verify.payload;

    const password = email + process.env.GOOGLE_SECRET;

    const passwordHash = await bcrypt.hash(password, 12);

    if (!email_verified)
      return res.status(400).json({ msg: "Email verification failed." });

    const user = await Users.findOne({ email });

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ msg: "Password is incorrect." });

      const refresh_token = createRefreshToken({ id: user._id });
      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ msg: "Login success!" });
    } else {
      const newUser = new Users({
        name,
        email,
        password: passwordHash,
        avatar: picture,
      });

      await newUser.save();

      const refresh_token = createRefreshToken({ id: newUser._id });
      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ msg: "Login success!" });
    }
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const facebookLogin = async (req, res) => {
  try {
    const { accessToken, userID } = req.body;

    const URL = `https://graph.facebook.com/v2.9/${userID}/?fields=id,name,email,picture&access_token=${accessToken}`;

    const data = await fetch(URL)
      .then((res) => res.json())
      .then((res) => {
        return res;
      });

    const { email, name, picture } = data;

    const password = email + process.env.FACEBOOK_SECRET;

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await Users.findOne({ email });

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ msg: "Password is incorrect." });

      const refresh_token = createRefreshToken({ id: user._id });
      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ msg: "Login success!" });
    } else {
      const newUser = new Users({
        name,
        email,
        password: passwordHash,
        avatar: picture.data.url,
      });

      await newUser.save();

      const refresh_token = createRefreshToken({ id: newUser._id });
      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ msg: "Login success!" });
    }
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

const createActivationToken = (payload) => {
  return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {
    expiresIn: "5m",
  });
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};
