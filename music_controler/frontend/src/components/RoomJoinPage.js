import React, { Component } from "react";
import { TextField, Button, Grid, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

// --- The Wrapper Function to provide the 'navigate' prop ---
function RoomJoinPageWithNavigate(props) {
  const navigate = useNavigate();
  return <RoomJoinPage {...props} navigate={navigate} />;
}

// --- The Main Class Component ---
class RoomJoinPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomCode: "",
      error: "",
    };
    this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
    this.roomButtonPressed = this.roomButtonPressed.bind(this);
  }

  handleTextFieldChange(e) {
    this.setState({
      roomCode: e.target.value,
    });
  }

  roomButtonPressed() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: this.state.roomCode,
      }),
    };
    fetch("/api/join-room", requestOptions)
      .then((response) => {
        if (response.ok) {
          // This is the corrected navigation line
          this.props.navigate(`/room/${this.state.roomCode}`);
        } else {
          this.setState({ error: "Room not found." });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    return (
      <Grid container spacing={1} direction="column" alignItems="center">
        <Grid>
          <Typography variant="h4" component="h4">
            Join a Room
          </Typography>
        </Grid>
        <Grid>
          <TextField
            error={!!this.state.error}
            label="Code"
            placeholder="Enter a Room Code"
            value={this.state.roomCode}
            helperText={this.state.error}
            variant="outlined"
            onChange={this.handleTextFieldChange}
          />
        </Grid>
        <Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={this.roomButtonPressed}
          >
            Enter Room
          </Button>
        </Grid>
        <Grid>
          <Button variant="contained" color="secondary" to="/" component={Link}>
            Back
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default RoomJoinPageWithNavigate;