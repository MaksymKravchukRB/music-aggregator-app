import React from "react";

const LoginButton = () => (
  <button onClick={() => (window.location.href = "/login")}>
    Login to Spotify
  </button>
);

export default LoginButton;
