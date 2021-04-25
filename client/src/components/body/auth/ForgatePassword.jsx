import React, { useState } from "react";
import classes from "./auth.module.css";
import {
  showErrMsg,
  showSuccessMsg,
} from "../../utils/notification/Notification.js";
import { isEmail } from "../../utils/validation/Validation.js";
import { TextField, Button, Card, CardContent, Grow } from "@material-ui/core";
import axios from "axios";

const initialState = {
  email: "",
  err: "",
  success: "",
};

const ForgatePassword = () => {
  const [data, setData] = useState(initialState);
  const { email, err, success } = data;

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value, err: "", success: "" });
  };

  const forgotPassword = async () => {
    if (!isEmail(email))
      return setData({ ...data, err: "Invalid emails.", success: "" });

    try {
      const res = await axios.post("/user/forgot", { email });

      return setData({ ...data, err: "", success: res.data.msg });
    } catch (err) {
      err.response.data.msg &&
        setData({ ...data, err: err.response.data.msg, success: "" });
    }
  };
  return (
    <div className={classes.login_page}>
    <Grow in>
    <Card style={{ marginTop: "30px" }} variant="outlined">
        <CardContent>
          <h2 style={{textAlign: "center"}}>Forgot Your Password?</h2>
          <div>
            {err && showErrMsg(err)}
            {success && showSuccessMsg(success)}
            <div style={{ marginTop: "20px" }}>
              <TextField
                type="email"
                label="Enter your email"
                variant="outlined"
                name="email"
                value={email}
                fullWidth
                onChange={handleChangeInput}
              />
            </div>
            <div className={classes.row}>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                style={{ marginTop: "18px" }}
                onClick={forgotPassword}
              >
                Verify your email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Grow>
    </div>
  );
};

export default ForgatePassword;
