import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import HomePage from './HomePage';

export default class App extends Component {
  render() {
    return (
    <div>
      <HomePage />
    </div>);
   }
}

const container = document.getElementById('root');
const root = createRoot(container);

