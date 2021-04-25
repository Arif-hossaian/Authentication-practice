import {
  Container,
  Grid,
  Grow,
  Card,
  CardContent,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@material-ui/core";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { isLength, isMatch } from "../../utils/validation/Validation.js";
import {
  showErrMsg,
  showSuccessMsg,
} from "../../utils/notification/Notification.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faEdit,
  faTimes,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {
  fetchAllUsers,
  dispatchGetAllUsers,
} from "../../../redux/actions/usersActions.js";
import classes from "./profile.module.css";

const initialState = {
  name: "",
  password: "",
  cf_password: "",
  err: "",
  success: "",
};
const Profile = () => {
  const auth = useSelector((state) => state.auth);
  const token = useSelector((state) => state.token);

  const users = useSelector((state) => state.users);

  const { user, isAdmin } = auth;
  const [data, setData] = useState(initialState);
  const { name, password, cf_password, err, success } = data;

  const [avatar, setAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [callback, setCallback] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (isAdmin) {
      fetchAllUsers(token).then((res) => {
        dispatch(dispatchGetAllUsers(res));
      });
    }
  }, [token, isAdmin, dispatch, callback]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value, err: "", success: "" });
  };

  //Change Avatar
  const changeAvatar = async (e) => {
    e.preventDefault();
    try {
      const file = e.target.files[0];

      if (!file)
        return setData({
          ...data,
          err: "No files were uploaded.",
          success: "",
        });

      if (file.size > 1024 * 1024)
        return setData({ ...data, err: "Size too large.", success: "" });

      if (file.type !== "image/jpeg" && file.type !== "image/png")
        return setData({
          ...data,
          err: "File format is incorrect.",
          success: "",
        });

      let formData = new FormData();
      formData.append("file", file);

      setLoading(true);
      const res = await axios.post("/api/upload_avatar", formData, {
        headers: {
          "content-type": "multipart/form-data",
          Authorization: token,
        },
      });

      setLoading(false);
      setAvatar(res.data.url);
    } catch (err) {
      setData({ ...data, err: err.response.data.msg, success: "" });
    }
  };

  //Update user Information
  const updateInfor = () => {
    try {
      axios.patch(
        "/user/update",
        {
          name: name ? name : user.name,
          avatar: avatar ? avatar : user.avatar,
        },
        {
          headers: { Authorization: token },
        }
      );

      setData({ ...data, err: "", success: "Updated Success!" });
    } catch (err) {
      setData({ ...data, err: err.response.data.msg, success: "" });
    }
  };

  //Update User-password
  const updatePassword = () => {
    if (isLength(password))
      return setData({
        ...data,
        err: "Password must be at least 6 characters.",
        success: "",
      });

    if (!isMatch(password, cf_password))
      return setData({ ...data, err: "Password did not match.", success: "" });

    try {
      axios.post(
        "/user/reset",
        { password },
        {
          headers: { Authorization: token },
        }
      );

      setData({ ...data, err: "", success: "Updated Success!" });
    } catch (err) {
      setData({ ...data, err: err.response.data.msg, success: "" });
    }
  };

  //Update on Button-Click
  const handleUpdate = () => {
    if (name || avatar) updateInfor();
    if (password) updatePassword();
  };

  //Delete from admin section user
  const handleDelete = async (id) => {
    try {
      if (user._id !== id) {
        if (window.confirm("Are you sure you want to delete this account?")) {
          setLoading(true);
          await axios.delete(`/user/delete/${id}`, {
            headers: { Authorization: token },
          });
          setLoading(false);
          setCallback(!callback);
        }
      }
    } catch (err) {
      setData({ ...data, err: err.response.data.msg, success: "" });
    }
  };

  return (
    <>
      <div>
        {err && showErrMsg(err)}
        {success && showSuccessMsg(success)}
        {loading && <h3>Loading.....</h3>}
      </div>
      <Grow in>
        <Container>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={4} xs={12} className={classes.left_grid}>
                  <h2 style={{ textAlign: "center" }}>
                    {isAdmin ? "Admin profile" : "User profile"}
                  </h2>
                  <div className={classes.avatar}>
                    <img src={avatar ? avatar : user.avatar} alt="" />
                    <span>
                      {/* <FontAwesomeIcon icon={faCamera} /> */}
                      {/* <p >Change</p> */}
                      <input
                        type="file"
                        name="file"
                        id="file_up"
                        onChange={changeAvatar}
                      />
                    </span>
                  </div>
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      defaultValue={user.name}
                      onChange={handleChange}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      defaultValue={user.email}
                      placeholder="Your email address"
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">New Password</label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      placeholder="Your password"
                      value={password}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cf_password">Confirm New Password</label>
                    <input
                      type="password"
                      name="cf_password"
                      id="cf_password"
                      placeholder="Confirm password"
                      value={cf_password}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <em style={{ color: "crimson" }}>
                      * If you update your password here, you will not be able
                      to login quickly using google and facebook.
                    </em>
                  </div>
                  <div style={{ marginTop: "18px" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      size="large"
                      onClick={handleUpdate}
                    >
                      Update
                    </Button>
                  </div>
                </Grid>
                <Grid item md={8} sm={12} className={classes.right_grid}>
                  <h2 style={{ textAlign: "center" }}>
                    {isAdmin ? "Users" : "My Orders"}
                  </h2>
                  <div>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>ID</TableCell>
                            {/* <TableCell  align="right">ID</TableCell> */}
                            <TableCell align="center">Name</TableCell>
                            <TableCell align="center">Email</TableCell>
                            <TableCell align="center">Admin</TableCell>
                            <TableCell align="center">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user._id}>
                              <TableCell component="th" scope="row">
                                {user._id}
                              </TableCell>
                              <TableCell
                                component="th"
                                scope="row"
                                align="center"
                              >
                                {user.name}
                              </TableCell>
                              <TableCell
                                component="th"
                                scope="row"
                                align="center"
                              >
                                {user.email}
                              </TableCell>
                              <TableCell
                                component="th"
                                scope="row"
                                align="center"
                              >
                                {user.role === 1 ? (
                                  <FontAwesomeIcon icon={faCheck} color="green"/>
                                ) : (
                                  <FontAwesomeIcon icon={faTimes} color="red"/>
                                )}
                              </TableCell>
                              <TableCell>
                                <Link to={`/edit_user/${user._id}`}>
                                  <FontAwesomeIcon icon={faEdit} title="Edit" />
                                </Link>
                                <FontAwesomeIcon
                                  icon={faTrash}
                                  title="Remove"
                                  style={{marginLeft: "15px"}}
                                  color="red"
                                  onClick={() => handleDelete(user._id)}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      </Grow>
    </>
  );
};

export default Profile;
