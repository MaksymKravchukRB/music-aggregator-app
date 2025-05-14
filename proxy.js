import nodeFetch from "node-fetch";
import { getFreshSpotifyAccessToken } from "./auth-utils.js";

// A proxy that overrides global fetch to inject auth headers dynamically.
global.fetch = async function proxyFetch(url, options = {}) {
  const finalOptions = { ...options, headers: { ...options.headers } };

  // Spotify API authentication
  if (
    typeof url === "string" &&
    url.includes("api.spotify.com") &&
    options.userSession
  ) {
    const accessToken = await getFreshSpotifyAccessToken(options.userSession);
    finalOptions.headers["Authorization"] = `Bearer ${accessToken}`;
    delete finalOptions.userSession; // Clean up
    console.log("[fetch proxy] global.fetch has been overridden");
  }

  return nodeFetch(url, finalOptions);
};
