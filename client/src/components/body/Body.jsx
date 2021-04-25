import React from "react";
import { Switch, Route } from "react-router-dom";
import ActivationEmail from "./auth/ActivationEmail";
import Login from "./auth/Login";
import NotFound from "../utils/NotFound/NotFound.js";
import Register from "./auth/Register";
import { useSelector } from "react-redux";
import ForgatePassword from "./auth/ForgatePassword";
import ResetPassword from "./auth/ResetPassword";
import Profile from "./profile/Profile";
import Home from "./Home-page/Home";

const Body = () => {
  const auth = useSelector((state) => state.auth);
  const { isLogged } = auth;
  return (
    <section>
      <Switch>
      <Route exact path="/" component={isLogged ? "" : Home}/>
        <Route exact path="/login" component={isLogged ? NotFound : Login} />
        <Route
          exact
          path="/register"
          component={isLogged ? NotFound : Register}
        />
        <Route
          exact
          path="/forgot_password"
          component={isLogged ? NotFound : ForgatePassword}
        />
        <Route
          exact
          path="/user/reset/:token"
          component={isLogged ? NotFound : ResetPassword}
        />
        <Route
          exact
          path="/user/activate/:activation_token"
          component={ActivationEmail}
        />
        <Route
          exact
          path="/profile"
          component={isLogged ? Profile : NotFound}
        />
      </Switch>
    </section>
  );
};

export default Body;
