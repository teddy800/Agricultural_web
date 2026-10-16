import React from "react";
import { createRoot } from "react-dom/client";
import AppIntegrated from "./AppIntegrated.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode><AppIntegrated /></React.StrictMode>
);
