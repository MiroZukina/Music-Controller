import React from "react";
import { createRoot } from "react-dom/client"; // Correct import path
import App from "./components/App";

// 1. Find the root DOM element
const container = document.getElementById("app");

// 2. Create a root
const root = createRoot(container);

// 3. Render your App component into the root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);