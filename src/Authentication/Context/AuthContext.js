import React, { createContext, useState } from "react";
import axios from "axios";
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

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
