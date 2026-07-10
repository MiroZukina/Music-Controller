import React, { useRef, useState, useEffect } from "react";
import { Card, Grid, Typography, IconButton, Slider, Box } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const MusicPlayer = ({ song, canPause, isHost, votesToSkip, onSkip, onEnded }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setIsDragging(false);
    if (audioRef.current) {
      audioRef.current.load();
      const p = audioRef.current.play();
      if (p) {
        p.then(() => setPlaying(true)).catch(() => setPlaying(false));
      }
    }
  }, [song.id]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      if (!canPause) return;
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  };

  const onTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!isDragging) {
      setCurrentTime(audio.currentTime);
    }
    if (Number.isFinite(audio.duration)) {
      setDuration(audio.duration);
    }
  };

  const onLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio && Number.isFinite(audio.duration)) {
      setDuration(audio.duration);
    }
  };

  const handleSeekChange = (event, value) => {
    if (!canPause) return;
    setIsDragging(true);
    setDragValue(value);
  };

  const handleSeekCommit = (event, value) => {
    if (!canPause) return;
    const audio = audioRef.current;
    if (audio && Number.isFinite(duration) && duration > 0) {
      audio.currentTime = value;
      setCurrentTime(value);
    }
    setIsDragging(false);
  };

  return (
    <Card sx={{ p: 3 }}>
      <audio
        ref={audioRef}
        src={song.preview_url}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => {
          setPlaying(false);
          if (onEnded) onEnded();
        }}
      />
      <Grid container alignItems="center" spacing={2}>
        <Grid item>
          <img src={song.artwork} alt="" width={96} height={96} style={{ borderRadius: 12 }} />
        </Grid>
        <Grid item style={{ flex: 1, overflow: "hidden" }}>
          <Typography variant="h6" noWrap>{song.title}</Typography>
          <Typography color="text.secondary" noWrap>{song.artist}</Typography>
        </Grid>
        <Grid item>
          <IconButton
            onClick={togglePlay}
            disabled={playing && !canPause}
            sx={{
              width: 56,
              height: 56,
              backgroundColor: "#a3e635",
              color: "#1a2416",
              "&:hover": { backgroundColor: "#bef264" },
              "&.Mui-disabled": {
                backgroundColor: "rgba(163, 230, 53, 0.3)",
                color: "rgba(26, 36, 22, 0.6)",
              },
            }}
          >
            {playing ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton
            onClick={onSkip}
            title={isHost ? "Skip" : `Vote to skip (${song.votes}/${votesToSkip})`}
            sx={{
              ml: 1,
              width: 56,
              height: 56,
              color: "#a3e635",
              border: "1px solid rgba(163, 230, 53, 0.4)",
              "&:hover": {
                borderColor: "#a3e635",
                backgroundColor: "rgba(163, 230, 53, 0.08)",
              },
            }}
          >
            <SkipNextIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Slider
        value={isDragging ? dragValue : currentTime}
        min={0}
        max={duration || 0}
        disabled={!canPause}
        onChange={handleSeekChange}
        onChangeCommitted={handleSeekCommit}
        sx={{
          mt: 3,
          height: 8,
          color: "#a3e635",
          padding: "13px 0",
          "& .MuiSlider-rail": {
            backgroundColor: "rgba(163, 230, 53, 0.2)",
            opacity: 1,
          },
          "& .MuiSlider-track": {
            backgroundColor: "#a3e635",
            border: "none",
          },
          "& .MuiSlider-thumb": {
            width: 14,
            height: 14,
            backgroundColor: "#a3e635",
            "&:hover, &.Mui-focusVisible": {
              boxShadow: "0 0 0 8px rgba(163, 230, 53, 0.16)",
            },
          },
          "&.Mui-disabled": {
            color: "rgba(163, 230, 53, 0.4)",
          },
          "&.Mui-disabled .MuiSlider-rail": {
            backgroundColor: "rgba(163, 230, 53, 0.15)",
          },
        }}
      />
      <Box display="flex" justifyContent="space-between" mt={-1}>
        <Typography variant="caption" color="text.secondary">
          {formatTime(isDragging ? dragValue : currentTime)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatTime(duration)}
        </Typography>
      </Box>
      {!isHost && (
        <Typography variant="caption" color="text.secondary">
          Skip votes: {song.votes} / {votesToSkip}
        </Typography>
      )}
    </Card>
  );
};

export default MusicPlayer;