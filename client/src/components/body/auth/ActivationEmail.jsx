import axios from "axios";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  showErrMsg,
  showSuccessMsg,
} from "../../utils/notification/Notification.js";
import classes from "./auth.module.css";

const ActivationEmail = () => {
  const { activation_token } = useParams();
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (activation_token) {
      const activationEmail = async () => {
        try {
          const res = await axios.post("/user/activation", {
            activation_token,
          });
          setSuccess(res.data.msg);
        } catch (err) {
          err.response.data.msg && setErr(err.response.data.msg);
        }
      };
      activationEmail();
    }
  }, [activation_token]);
  return (
    <div className={classes.active_page}>
      {err && showErrMsg(err)}
      {success && showSuccessMsg(success)}
    </div>
  );
};

export default ActivationEmail;
