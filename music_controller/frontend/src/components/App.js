
import React, { Component } from "react";
import { render } from "react-dom";
import { createTheme, ThemeProvider, CssBaseline, Box } from "@mui/material";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./Navbar";
import HomePage from "./HomePage";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#a3e635",
      dark: "#84cc16",
      light: "#bef264",
      contrastText: "#1a2416",
    },
    background: {
      default: "#1a2416",
      paper: "#232f1d",
    },
    text: {
      primary: "#f0f4ec",
      secondary: "#9aa894",
    },
    divider: "rgba(163, 230, 53, 0.15)",
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontFamily: '"Sora", sans-serif' },
    h2: { fontFamily: '"Sora", sans-serif' },
    h3: { fontFamily: '"Sora", sans-serif' },
    h4: { fontFamily: '"Sora", sans-serif' },
    h5: { fontFamily: '"Sora", sans-serif' },
    h6: { fontFamily: '"Sora", sans-serif' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#1a2416",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#232f1d",
          backgroundImage: "none",
          border: "1px solid rgba(163, 230, 53, 0.15)",
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Navbar />
          <Box sx={{ pt: 8 }}>
            <HomePage />
          </Box>
        </Router>
      </ThemeProvider>
    );
  }
}
