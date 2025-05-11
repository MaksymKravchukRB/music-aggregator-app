import React from "react";

const LoginButton = () => (
  <button
    onClick={() => (window.location.href = "http://localhost:8888/login")}
  >
    Login to Spotify
  </button>
);

export default LoginButton;
