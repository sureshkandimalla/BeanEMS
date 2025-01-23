import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../Context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  //it needs to be user once clientId is available we can replace with it
  return localStorage.getItem("user") ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
