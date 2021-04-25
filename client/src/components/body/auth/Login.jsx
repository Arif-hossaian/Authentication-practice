import React, { useState } from "react";
import axios from "axios";
import { Button, Card, CardContent, Grow, TextField } from "@material-ui/core";
import { Link, useHistory } from "react-router-dom";
import {
  showErrMsg,
  showSuccessMsg,
} from "../../utils/notification/Notification.js";
import { dispatchLogin } from "../../../redux/actions/authAction.js";
import { useDispatch } from "react-redux";
import { GoogleLogin } from "react-google-login";
// import FacebookLogin from 'react-facebook-login';
import classes from "./auth.module.css";

const initialState = {
  email: "",
  password: "",
  err: "",
  success: "",
};

const Login = () => {
  const [user, setUser] = useState(initialState);
  const dispatch = useDispatch();
  const history = useHistory();

  const { email, password, err, success } = user;

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value, err: "", success: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/user/login", { email, password });
      setUser({ ...user, err: "", success: res.data.msg });

      localStorage.setItem("firstLogin", true);
      dispatch(dispatchLogin());
      history.push("/profile");
    } catch (err) {
      err.response.data.msg &&
        setUser({ ...user, err: err.response.data.msg, success: "" });
    }
  };

  //login with google
  const responseGoogle = async (response) => {
    try {
      // eslint-disable-next-line
      const res = await axios.post("/user/google_login", {
        tokenId: response.tokenId,
      });

      setUser({ ...user, error: "", success: res.data.msg });
      localStorage.setItem("firstLogin", true);

      dispatch(dispatchLogin());
      history.push("/");
    } catch (err) {
      err.response.data.msg &&
        setUser({ ...user, err: err.response.data.msg, success: "" });
    }
  };

  //login with Facebook
  // const responseFacebook = async (response) => {
  //   try {
  //     const { accessToken, userID } = response;
  //     const res = await axios.post("/user/facebook_login", {
  //       accessToken,
  //       userID,
  //     });

  //     setUser({ ...user, error: "", success: res.data.msg });
  //     localStorage.setItem("firstLogin", true);

  //     dispatch(dispatchLogin());
  //     history.push("/");
  //   } catch (err) {
  //     err.response.data.msg &&
  //       setUser({ ...user, err: err.response.data.msg, success: "" });
  //   }
  // };

  return (
    <div className={classes.login_page}>
      <Grow in>
        <Card style={{ marginTop: "30px" }} variant="outlined">
          <CardContent>
            <h2 style={{ textAlign: "center" }}>Login</h2>

            {err && showErrMsg(err)}
            {success && showSuccessMsg(success)}

            <form onSubmit={handleSubmit}>
              <div style={{ marginTop: "13px" }}>
                <TextField
                  type="email"
                  label="Enter email"
                  fullWidth
                  name="email"
                  value={email}
                  variant="outlined"
                  onChange={handleChangeInput}
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
              <div className={classes.row}>
                <Button
                  variant="outlined"
                  color="primary"
                  type="submit"
                  style={{ marginTop: "14px" }}
                  size="large"
                >
                  Login
                </Button>
                <Link to="/forgot_password">Forgot your password</Link>
              </div>
            </form>
            <div style={{ marginTop: "15px" }}>
              <p>
                New Customer? <Link to="/register">Register</Link>
              </p>
            </div>
            <div className={classes.hr}>Or Login With</div>
            <div className={classes.social}>
                <GoogleLogin
                    clientId="408786018016-mr1ilsslk4jr8gqqbhe87pp2ie5ubq91.apps.googleusercontent.com"
                    buttonText="Login with google"
                    onSuccess={responseGoogle}
                    cookiePolicy={'single_host_origin'}
                />
                
                {/* <FacebookLogin
                appId="1018678298871460"
                autoLoad={false}
                fields="name,email,picture"
                callback={responseFacebook} 
                /> */}

            </div>
          </CardContent>
        </Card>
      </Grow>
    </div>
  );
};

export default Login;
