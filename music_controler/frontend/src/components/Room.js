import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Grid, Button, Typography } from "@mui/material";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";

const Room = (props) => {
  const [roomDetails, setRoomDetails] = useState({
    votesToSkip: 2,
    guestCanPause: false,
    isHost: false,
  });
  const [song, setSong] = useState(null);
  const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { roomCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getRoomDetails();
    const interval = setInterval(getCurrentSong, 1000);
    return () => clearInterval(interval);
  }, [roomCode]);

  const getRoomDetails = () => {
    fetch("/api/get-room" + "?code=" + roomCode)
      .then((response) => {
        if (!response.ok) {
          props.leaveRoomCallback();
          navigate("/");
        }
        return response.json();
      })
      .then((data) => {
        setRoomDetails({
          votesToSkip: data.votes_to_skip,
          guestCanPause: data.guest_can_pause,
          isHost: data.is_host,
        });
        if (data.is_host) {
          authenticateSpotify();
        }
      });
  };

  const authenticateSpotify = () => {
    fetch("/spotify/is-authenticated")
      .then((response) => response.json())
      .then((data) => {
        setSpotifyAuthenticated(data.status);
        if (!data.status) {
          fetch("/spotify/get-auth-url")
            .then((response) => response.json())
            .then((data) => {
              window.location.replace(data.url);
            });
        }
      });
  };

  // --- THIS IS THE CORRECTED STATE-MERGING FUNCTION ---
  const getCurrentSong = () => {
    fetch("/spotify/current-song")
      .then((response) => {
        if (response.status === 204) {
          // If there's no song, set state to null to hide the player
          setSong(null);
          return null;
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          // Use the callback form to safely merge new data with previous state
          setSong((prevSong) => ({ ...prevSong, ...data }));
        }
      });
  };

  const leaveButtonPressed = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/api/leave-room", requestOptions).then((_response) => {
      props.leaveRoomCallback();
      navigate("/");
    });
  };

  const renderSettingsPanel = () => (
    <Grid container spacing={1}>
      <Grid xs={12} align="center">
        <CreateRoomPage
          update={true}
          votesToSkip={roomDetails.votesToSkip}
          guestCanPause={roomDetails.guestCanPause}
          roomCode={roomCode}
          updateCallback={getRoomDetails}
          closeCallback={() => setShowSettings(false)}
        />
      </Grid>
    </Grid>
  );

  const checkDevices = () => {
    fetch("/spotify/devices")
        .then(res => res.json())
        .then(data => {
            console.log("SPOTIFY DEVICES:", data);
            alert("Check the browser console for the list of Spotify devices.");
        });
}

const renderRoomDetails = () => (
  <Grid container spacing={1} direction="column" alignItems="center">
    <Grid item xs={12}>
      <Typography variant="h4" component="h4">
        Code: {roomCode}
      </Typography>
    </Grid>

    {song ? (
      <MusicPlayer {...song} refreshCallback={getCurrentSong} />
    ) : (
      <Typography>No song is currently playing.</Typography>
    )}

 
    {roomDetails.isHost && (
      <Grid item xs={12}>
        <Button variant="contained" onClick={checkDevices}>
          Check Spotify Devices
        </Button>
      </Grid>
    )}

    {roomDetails.isHost && (
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowSettings(true)}
        >
          Settings
        </Button>
      </Grid>
    )}


    <Grid item xs={12}>
      <Button
        variant="contained"
        color="secondary"
        onClick={leaveButtonPressed}
      >
        Leave Room
      </Button>
    </Grid>
  </Grid>
);

  return showSettings ? renderSettingsPanel() : renderRoomDetails();
};

export default Room;