import React from "react";
import { Outlet } from "react-router-dom";
import bglogo from "./bg_image1.jpg";
import headerBar from "../assets/intellan-header-bar.png";
const AuthLayout = () => {
  return (
    <div style={styles.pageContainer}>
      <img src={headerBar} alt="Intellan" style={styles.headerBar} />
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
    headerBar: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100px",
        objectFit: "cover",
        objectPosition: "left center",
      },
}