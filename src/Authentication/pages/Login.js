import React, { useContext } from "react";
import { GoogleLogin } from "@react-oauth/google";
import AuthContext from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../pages/bean-logo.png";  
//import bglogo from "../pages/bg_image1.jpg";  // ✅ Import Background Image

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLoginSuccess = (response) => {
    login(response); // Save user session
    navigate("/dashboard"); // Redirect to Dashboard
  };

  return (
    <div>      
      <div style={styles.loginBox}>        
        <div style={styles.googleLogin}>
          <GoogleLogin 
            onSuccess={handleLoginSuccess} 
            onError={() => console.log("Login Failed")}
            theme="outline"
            size="large"
          />
        </div>
      </div>
    </div>
  );
};


const styles = {  
  loginBox: {
    backgroundColor: "transparent", 
    padding: "30px",
    borderRadius: "10px",
    textAlign: "center",
    width: "350px",
  },
  title: {
    marginBottom: "10px",
    color: "rgb(71 107 148);", 
  },
  googleLogin: {
    position: "absolute",
    top: "20px",
    right: "20px", 
  }
};

export default Login;
