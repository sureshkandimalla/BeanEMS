import React, { createContext, useState } from "react";
import axios from "axios";
import { googleLogout } from "@react-oauth/google";
import API_ENDPOINTS from "../../config";

const AuthContext = createContext(); // Ensure this is properly exported

const readStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);

  // The Google credential is verified server-side (see AuthController) —
  // this is no longer a client-side decode. Rejects (domain not on the
  // allowlist, etc.) throw so Login.js can show the actual reason instead
  // of silently granting access, which is the whole point of moving
  // verification server-side in the first place.
  const login = async (credentialResponse) => {
    const response = await axios.post(API_ENDPOINTS.authLogin, {
      credential: credentialResponse.credential,
    });
    const loggedInUser = response.data;
    setUser(loggedInUser);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  // Clearing localStorage.user alone left two things behind: (1) Google's own
  // GSI session, so the next "Sign in with Google" silently re-authenticated
  // the same account without an account picker — real problem for a
  // multi-tenant app where switching between a Bean and an Intellan account
  // is expected; googleLogout() clears that cached credential state.
  // (2) stray non-namespaced keys (projectId/projectName, set by
  // ProjectFullDetails) that could leak a previous tenant's project id into
  // the next login's session. A hard reload (not just React state reset)
  // guarantees every in-memory closure/cache from the old session is gone.
  const logout = () => {
    googleLogout();
    localStorage.removeItem("user");
    localStorage.removeItem("projectId");
    localStorage.removeItem("projectName");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
