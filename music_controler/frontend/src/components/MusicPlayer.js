import React, { useRef, useState, useEffect } from "react";
import { Card, Grid, Typography, IconButton, LinearProgress } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";

const MusicPlayer = ({ song, canPause, isHost, votesToSkip, onSkip, onEnded }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
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
    if (audio && audio.duration) {
      setProgress((audio.currentTime / audio.duration) * 100);
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <audio
        ref={audioRef}
        src={song.preview_url}
        onTimeUpdate={onTimeUpdate}
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
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          mt: 3,
          height: 8,
          borderRadius: 4,
          backgroundColor: "rgba(163, 230, 53, 0.15)",
          "& .MuiLinearProgress-bar": {
            backgroundColor: "#a3e635",
            borderRadius: 4,
          },
        }}
      />
      {!isHost && (
        <Typography variant="caption" color="text.secondary">
          Skip votes: {song.votes} / {votesToSkip}
        </Typography>
      )}
    </Card>
  );
};

export default MusicPlayer;