import { Card, CardContent, Grow, TextField, Button } from "@material-ui/core";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import classes from "./auth.module.css";
import {
  showErrMsg,
  showSuccessMsg,
} from "../../utils/notification/Notification.js";
import { isLength, isMatch } from "../../utils/validation/Validation.js";
import axios from "axios";

const initialState = {
  password: "",
  cf_password: "",
  err: "",
  success: "",
};
const ResetPassword = () => {
  const [data, setData] = useState(initialState);
  const { token } = useParams();

  const { password, cf_password, err, success } = data;

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value, err: "", success: "" });
  };

  const handleResetPass = async () => {
    if (isLength(password))
      return setData({
        ...data,
        err: "Password must be at least 6 characters.",
        success: "",
      });

    if (!isMatch(password, cf_password))
      return setData({ ...data, err: "Password did not match.", success: "" });

    try {
      const res = await axios.post(
        "/user/reset",
        { password },
        {
          headers: { Authorization: token },
        }
      );

      return setData({ ...data, err: "", success: res.data.msg });
    } catch (err) {
      err.response.data.msg &&
        setData({ ...data, err: err.response.data.msg, success: "" });
    }
  };
  return (
    <div className={classes.login_page}>
      <Grow in>
        <Card>
          <CardContent>
            <h2 style={{ textAlign: "center" }}>Reset Your Password</h2>
            <div>
              {err && showErrMsg(err)}
              {success && showSuccessMsg(success)}
            </div>
            <div style={{ marginTop: "13px" }}>
              <TextField
                type="password"
                label="Enter new password"
                fullWidth
                name="password"
                value={password}
                variant="outlined"
                onChange={handleChangeInput}
                required
              />
            </div>
            <div style={{ marginTop: "20px" }}>
              <TextField
                type="password"
                label="Enter confirm password"
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
                onClick={handleResetPass}
              >
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </Grow>
    </div>
  );
};

export default ResetPassword;
