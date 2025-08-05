import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";


import {
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";


const Info = (props) => {
  const pages = {
    JOIN: "pages.join",
    CREATE: "pages.create",
  };

  useEffect(() => {
    console.log("ran");
    return () => console.log("cleanup");
  });


  const [page, setPage] = useState(pages.JOIN);

  const joinInfo = () => "Join a room and listen along with friends!";
  const createInfo = () => "Create a room and invite your friends to a collaborative playlist!";

  return (
    <Grid container spacing={1} direction="column" alignItems="center">
      <Grid item xs={12}>
        <Typography component="h4" variant="h4">
          What is House Party?
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">
          {page === pages.JOIN ? joinInfo() : createInfo()}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <IconButton onClick={() => setPage(page === pages.JOIN ? pages.CREATE : pages.JOIN)}>
          {page === pages.JOIN ? <NavigateNextIcon /> : <NavigateBeforeIcon />}
        </IconButton>
      </Grid>
      <Grid item xs={12}>
        <Button color="secondary" variant="contained" to="/" component={Link}>
          Back
        </Button>
      </Grid>
    </Grid>
  );
};

export default Info;