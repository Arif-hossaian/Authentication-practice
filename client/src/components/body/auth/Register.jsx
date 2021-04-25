import React, { useState } from "react";
import axios from "axios";
import { Button, Card, CardContent, Grow, TextField } from "@material-ui/core";
import { Link } from "react-router-dom";
import {
  showErrMsg,
  showSuccessMsg,
} from "../../utils/notification/Notification.js";
import {
  isEmpty,
  isEmail,
  isLength,
  isMatch,
} from "../../utils/validation/Validation.js";
import classes from "./auth.module.css";

const initialState = {
  name: "",
  email: "",
  password: "",
  cf_password: "",
  err: "",
  success: "",
};

const Register = () => {
  const [user, setUser] = useState(initialState);

  const { name, email, password, cf_password, err, success } = user;

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value, err: "", success: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEmpty(name) || isEmpty(password))
      return setUser({
        ...user,
        err: "Please fill in all fields.",
        success: "",
      });

    if (!isEmail(email))
      return setUser({ ...user, err: "Invalid emails.", success: "" });

    if (isLength(password))
      return setUser({
        ...user,
        err: "Password must be at least 6 characters.",
        success: "",
      });

    if (!isMatch(password, cf_password))
      return setUser({ ...user, err: "Password did not match.", success: "" });

    try {
      const res = await axios.post("/user/register", { name, email, password });
      setUser({ ...user, err: "", success: res.data.msg });
      
    } catch (err) {
      err.response.data.msg &&
        setUser({ ...user, err: err.response.data.msg, success: "" });
    }
  };
  return (
    <div className={classes.login_page}>
    <Grow in>
    <Card style={{ marginTop: "30px" }} variant="outlined">
        <CardContent>
          <h2 style={{ textAlign: "center" }}>Register</h2>

          {err && showErrMsg(err)}
          {success && showSuccessMsg(success)}

          <form onSubmit={handleSubmit}>
            <div style={{ marginTop: "13px" }}>
              <TextField
                type="name"
                label="Enter your name"
                fullWidth
                name="name"
                value={name}
                variant="outlined"
                onChange={handleChangeInput}
                required
              />
            </div>
            <div style={{ marginTop: "20px" }}>
              <TextField
                type="email"
                label="Enter your email"
                name="email"
                value={email}
                onChange={handleChangeInput}
                fullWidth
                variant="outlined"
                required
              />
            </div>
            <div style={{ marginTop: "20px" }}>
              <TextField
                type="password"
                label="Enter password"
                name="password"
                value={password}
                onChange={handleChangeInput}
                fullWidth
                variant="outlined"
                required
              />
            </div>
            <div style={{ marginTop: "20px" }}>
              <TextField
                type="password"
                label="Enter Confirm password"
                name="cf_password"
                value={cf_password}
                onChange={handleChangeInput}
                fullWidth
                variant="outlined"
                required
              />
            </div>
            <div className={classes.row}>
              <Button
                variant="outlined"
                color="primary"
                type="submit"
                style={{ marginTop: "14px" }}
                size="large"
                fullWidth
              >
                Register
              </Button>
            </div>
          </form>
          <div style={{ marginTop: "15px" }}>
            <p>
              Already an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </Grow>
    </div>
  );
};

export default Register;
