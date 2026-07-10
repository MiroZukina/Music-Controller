import React, { Component } from "react";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";

import { Grid, Button, Typography } from "@mui/material";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Info from "./info";

export default class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomCode: null,
    };
    // 1. Bind the new method to 'this'
    this.clearRoomCode = this.clearRoomCode.bind(this);
  }

  async componentDidMount() {
    fetch("/api/user-in-room")
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          roomCode: data.code,
        });
      });
  }

  // 2. Define the method to clear the room code
  clearRoomCode() {
    this.setState({
      roomCode: null,
    });
  }

  renderHomePage() {
    return (
      <Grid
        container
        spacing={3}
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: "calc(100vh - 64px)", textAlign: "center", px: 3 }}
      >
        <Grid item>
          <Typography
            variant="h2"
            component="h1"
            sx={{ fontWeight: 700, letterSpacing: -0.5 }}
          >
            Music Room
          </Typography>
        </Grid>
        <Grid item sx={{ maxWidth: 420 }}>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            Create a room, share the code, and vote on what plays next.
          </Typography>
        </Grid>
        <Grid item sx={{ mt: 2 }}>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button
                size="large"
                variant="contained"
                color="primary"
                to="/create"
                component={Link}
                sx={{ borderRadius: 999, px: 4, py: 1.5 }}
              >
                Create Room
              </Button>
            </Grid>
            <Grid item>
              <Button
                size="large"
                variant="outlined"
                color="primary"
                to="/join"
                component={Link}
                sx={{ borderRadius: 999, px: 4, py: 1.5 }}
              >
                Join Room
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item sx={{ mt: 1 }}>
          <Typography
            variant="body2"
            component={Link}
            to="/info"
            sx={{
              color: "#a3e635",
              textDecoration: "none",
              "&:hover": { color: "#bef264" },
            }}
          >
            What is Music Room?
          </Typography>
        </Grid>
      </Grid>
    );
  }

  render() {
    return (
      <Routes>
        <Route
          path="/"
          element={
            this.state.roomCode ? (
              <Navigate to={`/room/${this.state.roomCode}`} />
            ) : (
              this.renderHomePage()
            )
          }
        />
        <Route path="/join" element={<RoomJoinPage />} />
        <Route path="/create" element={<CreateRoomPage />} />
        <Route path="/info" element={<Info />} />
        <Route
          path="/room/:roomCode"
          element={<Room leaveRoomCallback={this.clearRoomCode} />}
        />
      </Routes>
    );
  }
}