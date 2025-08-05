import React, { Component } from 'react';
import RoomJoinPage from './RoomJoinPage';
import CreateRoomPage from './CreateRoomPage';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default class HomePage extends Component {
  render() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<p>This is the new home page</p>} />
          <Route path="/join" element={<RoomJoinPage />} />
          <Route path="/create" element={<CreateRoomPage />} />
        </Routes>
      </Router>
    );
  }
}
