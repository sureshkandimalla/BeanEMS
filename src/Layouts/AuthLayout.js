import React from "react";
import { Outlet } from "react-router-dom";
import bglogo from "./bg_image1.jpg"
import logo from "../bean-logo.png"
const AuthLayout = () => {
  return (
    <div style={styles.pageContainer}> 
    <img src={logo} alt="Company Logo" style={styles.logo} />     
      <Outlet /> 
    </div>
  );
};

export default AuthLayout;

const styles = {
    pageContainer: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",       
        width: "100vw",        
        overflow: "hidden",    
        backgroundImage: `url(${bglogo})`, 
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",        
        position: "relative",
    },
    logo: {
        position: "absolute",
        top: "20px",        
        left: "20px",       
        width: "120px",     
      },
}