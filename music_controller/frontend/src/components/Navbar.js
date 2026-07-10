import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Box, Typography, Chip, Button, IconButton, Tooltip, Snackbar } from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";

const Navbar = () => {
  const [roomCode, setRoomCode] = useState(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetch("/api/user-in-room")
      .then((response) => response.json())
      .then((data) => setRoomCode(data.code))
      .catch(() => setRoomCode(null));
  }, [location]);

  const handleLeave = () => {
    fetch("/api/leave-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).then(() => {
      setRoomCode(null);
      navigate("/");
    });
  };

  const copyRoomCode = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(roomCode).then(() => setCodeCopied(true));
  };

  return (
    <>
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: "#232f1d",
        borderBottom: "1px solid rgba(163, 230, 53, 0.15)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
          }}
        >
          <MusicNoteIcon sx={{ color: "#a3e635" }} />
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Sora", sans-serif',
              fontWeight: 700,
              color: "#f0f4ec",
            }}
          >
            Music Room
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {roomCode ? (
            <>
              <Chip
                label={roomCode}
                component={RouterLink}
                to={`/room/${roomCode}`}
                clickable
                sx={{
                  backgroundColor: "#a3e635",
                  color: "#1a2416",
                  fontFamily: '"Sora", sans-serif',
                  fontWeight: 700,
                  letterSpacing: 1,
                  "&:hover": { backgroundColor: "#bef264" },
                }}
              />
              <Tooltip title="Copy room code" arrow>
                <IconButton
                  size="small"
                  onClick={copyRoomCode}
                  sx={{ color: "#a3e635" }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Button variant="text" onClick={handleLeave} sx={{ color: "text.secondary" }}>
                Leave
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="text"
                to="/join"
                component={RouterLink}
                sx={{ color: "text.secondary" }}
              >
                Join
              </Button>
              <Button
                variant="text"
                to="/create"
                component={RouterLink}
                sx={{ color: "#a3e635" }}
              >
                Create
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
    <Snackbar
      open={codeCopied}
      autoHideDuration={1500}
      onClose={() => setCodeCopied(false)}
      message="Code copied!"
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    />
    </>
  );
};

export default Navbar;
