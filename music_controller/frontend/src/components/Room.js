import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Grid, Button, Typography, TextField, Card, IconButton, Chip, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";

const Room = (props) => {
  const [roomDetails, setRoomDetails] = useState({
    votesToSkip: 2,
    guestCanPause: false,
    isHost: false,
  });
  const [queue, setQueue] = useState({ current: null, upcoming: [] });
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [codeCopied, setCodeCopied] = useState(false);

  const { roomCode } = useParams();
  const navigate = useNavigate();
  const currentIdRef = useRef(null);

  useEffect(() => {
    getRoomDetails();
    getQueue();
    const interval = setInterval(getQueue, 2000);
    return () => clearInterval(interval);
  }, [roomCode]);

  const getRoomDetails = () => {
    fetch("/api/get-room?code=" + roomCode)
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
      });
  };

  const getQueue = () => {
    fetch("/api/get-queue?code=" + roomCode)
      .then((res) => res.json())
      .then((data) => {
        setQueue({ current: data.current, upcoming: data.upcoming || [] });
        currentIdRef.current = data.current ? data.current.id : null;
      });
  };

  const searchSongs = () => {
    if (!searchQuery.trim()) return;
    fetch("/api/search-songs?q=" + encodeURIComponent(searchQuery))
      .then((res) => res.json())
      .then(setSearchResults);
  };

  const addToQueue = (song) => {
    fetch("/api/add-to-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: roomCode, ...song }),
    }).then(() => {
      setSearchResults([]);
      setSearchQuery("");
      getQueue();
    });
  };

  const skipSong = () => {
    fetch("/api/vote-skip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: roomCode }),
    }).then(() => getQueue());
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 1500);
    });
  };

  const leaveButtonPressed = () => {
    fetch("/api/leave-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).then(() => {
      props.leaveRoomCallback();
      navigate("/");
    });
  };

  if (showSettings) {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
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
  }

  const resultCardSx = {
    display: "flex",
    alignItems: "center",
    p: 3,
    mt: 1,
    transition: "border-color 0.2s ease",
    "&:hover": { borderColor: "rgba(163, 230, 53, 0.45)" },
  };

  return (
    <Grid container spacing={2} direction="column" alignItems="center" sx={{ py: 4, px: 2 }}>
      <Grid item xs={12}>
        <Grid container direction="column" alignItems="center" spacing={1}>
          <Grid item>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5 }}>
              Room
            </Typography>
          </Grid>
          <Grid item>
            <Tooltip title="Copy room code" arrow>
              <Chip
                icon={<ContentCopyIcon fontSize="small" />}
                label={codeCopied ? "Copied!" : roomCode}
                onClick={copyRoomCode}
                clickable
                sx={{
                  backgroundColor: "#a3e635",
                  color: "#1a2416",
                  fontFamily: '"Sora", sans-serif',
                  fontWeight: 700,
                  letterSpacing: 1,
                  px: 1,
                  "& .MuiChip-icon": { color: "#1a2416" },
                  "&:hover": { backgroundColor: "#bef264" },
                }}
              />
            </Tooltip>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} style={{ width: "100%", maxWidth: 480 }}>
        <Grid container spacing={1}>
          <Grid item xs={9}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search for a song..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchSongs()}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#1f2a19",
                  "& fieldset": { borderColor: "rgba(163, 230, 53, 0.15)" },
                  "&:hover fieldset": { borderColor: "rgba(163, 230, 53, 0.4)" },
                  "&.Mui-focused fieldset": { borderColor: "#a3e635", borderWidth: 2 },
                },
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <Button fullWidth variant="contained" color="primary" onClick={searchSongs}>
              Search
            </Button>
          </Grid>
        </Grid>
        {searchResults.map((song, i) => (
          <Card key={i} sx={resultCardSx}>
            <img src={song.artwork} alt="" width={44} height={44} style={{ borderRadius: 8 }} />
            <div style={{ flex: 1, marginLeft: 12, overflow: "hidden" }}>
              <Typography noWrap>{song.title}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {song.artist}
              </Typography>
            </div>
            <IconButton onClick={() => addToQueue(song)} sx={{ color: "#a3e635" }}>
              <AddIcon />
            </IconButton>
          </Card>
        ))}
      </Grid>

      <Grid item xs={12} style={{ width: "100%", maxWidth: 480 }}>
        {queue.current ? (
          <MusicPlayer
            song={queue.current}
            canPause={roomDetails.isHost || roomDetails.guestCanPause}
            isHost={roomDetails.isHost}
            votesToSkip={roomDetails.votesToSkip}
            onSkip={skipSong}
            onEnded={roomDetails.isHost ? skipSong : undefined}
          />
        ) : (
          <Typography align="center" color="text.secondary">
            Queue is empty — search and add a song!
          </Typography>
        )}
      </Grid>

      {queue.upcoming.length > 0 && (
        <Grid item xs={12} style={{ width: "100%", maxWidth: 480 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Up next</Typography>
          {queue.upcoming.map((song) => (
            <Card key={song.id} sx={resultCardSx}>
              <img src={song.artwork} alt="" width={36} height={36} style={{ borderRadius: 8 }} />
              <div style={{ flex: 1, marginLeft: 12, overflow: "hidden" }}>
                <Typography variant="body2" noWrap>
                  {song.title} — {song.artist}
                </Typography>
              </div>
            </Card>
          ))}
        </Grid>
      )}

      <Grid item xs={12} sx={{ mt: 1 }}>
        {roomDetails.isHost && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowSettings(true)}
            sx={{ mr: 1, borderRadius: 999 }}
          >
            Settings
          </Button>
        )}
        <Button
          variant="outlined"
          onClick={leaveButtonPressed}
          sx={{
            borderRadius: 999,
            color: "#f87171",
            borderColor: "#f87171",
            "&:hover": { borderColor: "#f87171", backgroundColor: "rgba(248, 113, 113, 0.08)" },
          }}
        >
          Leave Room
        </Button>
      </Grid>
    </Grid>
  );
};

export default Room;