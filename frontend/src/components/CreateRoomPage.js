import React, { Component } from "react";
// --- CORRECTED IMPORTS ---
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

export default class CreateRoomPage extends Component {
  defaultVotes = 2;

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Typography component="h4" variant="h4">
            Create A Room
          </Typography>
        </Grid>
      </Grid>
    );
  }
}