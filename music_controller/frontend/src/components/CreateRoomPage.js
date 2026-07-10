import React, { Component } from "react";
import { Link } from "react-router-dom";
import { withRouter } from "../withRouter";
import {
  Button,
  Grid,
  Typography,
  TextField,
  FormHelperText,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  Collapse,
  Alert,
  Card,
} from "@mui/material";

class CreateRoomPage extends Component {
  static defaultProps = {
    votesToSkip: 2,
    guestCanPause: true,
    update: false,
    roomCode: null,
    updateCallback: () => {},
    closeCallback: () => {},
  };

  constructor(props) {
    super(props);
    // The state is the single source of truth for our form inputs
    this.state = {
      guestCanPause: this.props.guestCanPause,
      votesToSkip: this.props.votesToSkip,
      errorMsg: "",
      successMsg: "",
    };

    this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this);
    this.handleVotesChange = this.handleVotesChange.bind(this);
    this.handleGuestCanPauseChange = this.handleGuestCanPauseChange.bind(this);
    this.handleUpdateButtonPressed = this.handleUpdateButtonPressed.bind(this);
  }

  handleVotesChange(e) {
    this.setState({ votesToSkip: e.target.value });
  }

  handleGuestCanPauseChange(e) {
    // The incoming value is a string "true" or "false", so we convert it to a boolean
    this.setState({ guestCanPause: e.target.value === "true" });
  }

  handleRoomButtonPressed() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        votes_to_skip: this.state.votesToSkip,
        guest_can_pause: this.state.guestCanPause,
      }),
    };
    fetch("/api/create-room", requestOptions)
      .then((response) => response.json())
      .then((data) => this.props.navigate("/room/" + data.code));
  }

  handleUpdateButtonPressed() {
    const requestOptions = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        votes_to_skip: this.state.votesToSkip,
        guest_can_pause: this.state.guestCanPause,
        code: this.props.roomCode,
      }),
    };
    fetch("/api/update-room", requestOptions).then((response) => {
      if (response.ok) {
        this.setState({ successMsg: "Room updated successfully!" });
      } else {
        this.setState({ errorMsg: "Error updating room..." });
      }
      this.props.updateCallback();
    });
  }

  renderCreateButtons() {
    return (
      <Grid container spacing={1} direction="column" alignItems="center">
        <Grid item>
          <Button
            color="primary"
            variant="contained"
            onClick={this.handleRoomButtonPressed}
            sx={{ borderRadius: 999, px: 4 }}
          >
            Create A Room
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="text"
            to="/"
            component={Link}
            sx={{ color: "text.secondary" }}
          >
            Back
          </Button>
        </Grid>
      </Grid>
    );
  }

  renderUpdateButtons() {
    return (
      <Grid container spacing={1} direction="column" alignItems="center">
        <Grid item>
          <Button
            color="primary"
            variant="contained"
            onClick={this.handleUpdateButtonPressed}
            sx={{ borderRadius: 999, px: 4 }}
          >
            Update Room
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="text"
            onClick={this.props.closeCallback}
            sx={{ color: "text.secondary" }}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  }

  render() {
    const title = this.props.update ? "Update Room" : "Create a Room";

    return (
      <Grid container direction="column" alignItems="center" justifyContent="center" sx={{ minHeight: "calc(100vh - 64px)", px: 2 }}>
        <Card sx={{ p: 4, width: "100%", maxWidth: 420 }}>
          <Grid container spacing={1} direction="column" alignItems="center">
            <Grid xs={12} sx={{ width: "100%" }}>
              <Collapse
                in={this.state.errorMsg !== "" || this.state.successMsg !== ""}
              >
                {this.state.successMsg !== "" ? (
                  <Alert
                    severity="success"
                    onClose={() => {
                      this.setState({ successMsg: "" });
                    }}
                  >
                    {this.state.successMsg}
                  </Alert>
                ) : (
                  <Alert
                    severity="error"
                    onClose={() => {
                      this.setState({ errorMsg: "" });
                    }}
                  >
                    {this.state.errorMsg}
                  </Alert>
                )}
              </Collapse>
            </Grid>

            <Grid item>
              <Typography component="h4" variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {title}
              </Typography>
            </Grid>
            <Grid item>
              <FormControl component="fieldset">
                {/* FIX #1: Using a span with CSS styling to create valid HTML */}
                <FormHelperText>
                  <span style={{ display: 'block', textAlign: 'center' }}>
                    Guest Control of Playback State
                  </span>
                </FormHelperText>
                {/* FIX #2: Using the 'value' prop to make this a controlled component */}
                <RadioGroup
                  row
                  value={String(this.state.guestCanPause)}
                  onChange={this.handleGuestCanPauseChange}
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio color="primary" />}
                    label="Play/Pause"
                    labelPlacement="bottom"
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio color="primary" />}
                    label="No Control"
                    labelPlacement="bottom"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item>
              <FormControl>
                <TextField
                  required
                  type="number"
                  onChange={this.handleVotesChange}
                  defaultValue={this.state.votesToSkip}
                  inputProps={{ min: 1, style: { textAlign: "center" } }}
                />
                {/* FIX #3: Using a span with CSS styling here as well */}
                <FormHelperText>
                  <span style={{ display: 'block', textAlign: 'center' }}>
                    Votes Required To Skip Song
                  </span>
                </FormHelperText>
              </FormControl>
            </Grid>
            {this.props.update
              ? this.renderUpdateButtons()
              // Renders the create buttons if not in update mode
              : this.renderCreateButtons()}
          </Grid>
        </Card>
      </Grid>
    );
  }
}

export default withRouter(CreateRoomPage);