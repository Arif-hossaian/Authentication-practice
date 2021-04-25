import { makeStyles } from "@material-ui/core/styles";

export default makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    color:"white"
  },
  HomeLink: {
      color: "white",
      textDecoration: "none",
  },
  avatar: {
    width: "33px",
    height: "33px",
    transform: "translateY(10px)",
    borderRadius: "50%"
  },
  dropNab: {
    position: "relative",
    padding: "10px 0",
    color:  "red",
    '& a': {
      textTransform: "capitalize",
      overflow: "hidden"
    },
    '& dropdown': {
      position: "absolute",
    backGround: "#282c34",
    width: "100%",
    top: "50px",
    display: "none"
    },
    "& li":{
      display: "block",
    }
  },
}));
