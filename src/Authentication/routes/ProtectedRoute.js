import React from "react";
import { Navigate } from "react-router-dom";

// Gates on the presence of the app token issued by the backend after a
// verified Google login (see AuthContext.login / AuthController) — a stale
// entry from before this change has no token and correctly bounces back to
// login. The token's actual validity/expiry is enforced by the backend on
// every request (see AuthFilter); this is just the client-side "don't even
// render the page" fast path.
const ProtectedRoute = ({ children }) => {
  let token = null;
  try {
    token = JSON.parse(localStorage.getItem("user"))?.token || null;
  } catch {
    token = null;
  }
  return token ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
