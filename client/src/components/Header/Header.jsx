import React from "react";
import { Link } from "react-router-dom";
import { AppBar, Container, Toolbar, Typography } from "@material-ui/core";
import useStyles from "./styles.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import "./style.css";
import axios from "axios";

const Header = () => {
  const auth = useSelector((state) => state.auth);
  const { user, isLogged } = auth;

  const handleLogout = async () => {
    try {
      await axios.get("/user/logout");
      localStorage.removeItem("firstLogin");
      window.location.href = "/";
    } catch (err) {
      window.location.href = "/";
    }
  };

  const userLink = () => {
    return (
      <li style={{ listStyleType: "none" }} className="drop-nav">
        <Link to="#">
          <img src={user.avatar} alt="" className={classes.avatar} />{" "}
          {user.name} <FontAwesomeIcon icon={faAngleDown} />
        </Link>
        <ul className="dropdown">
          <li>
            <Link to="/profile">Profile</Link>
          </li>
          <li>
            <Link to="/" onClick={handleLogout}>
              Logout
            </Link>
          </li>
        </ul>
      </li>
    );
  };
  const classes = useStyles();
  const transForm = {
    transform: isLogged ? "translateY(-5px)" : 0,
  };
  return (
    <header>
      <div >
        <AppBar position="static" className={classes.root}>
        <Container>
        <Toolbar>
            <Typography variant="h5" className={classes.title}>
              <Link to="/" className={classes.HomeLink}>
                Arif's Auth-app
              </Link>
            </Typography>
            <ul style={transForm}>
              {isLogged ? (
                userLink()
              ) : (
                <li style={{ listStyle: "none" }}>
                  <Link to="/login" className={classes.HomeLink}>
                    <FontAwesomeIcon icon={faUser} size="1x" />{" "}
                    <span style={{ fontSize: "15px" }}>Sign-In</span>
                  </Link>
                </li>
              )}
            </ul>
          </Toolbar>
        </Container>
        </AppBar>
      </div>
    </header>
  );
};

export default Header;
