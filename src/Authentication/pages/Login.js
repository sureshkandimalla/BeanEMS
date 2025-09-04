import React, { useContext } from "react";
import { GoogleLogin } from "@react-oauth/google";
import AuthContext from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../pages/bean-logo.png";
//import bglogo from "../pages/bg_image1.jpg";  // ✅ Import Background Image

const Login = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  // If user is present, redirect to dashboard automatically
  React.useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // For local/dev, show a message or nothing
  if (user) {
    return null; // Already logged in, skip login UI
  }

  // If you want to keep GoogleLogin for production, you can use an env check here
  return (
    <div>
      <div style={styles.loginBox}>
        <div style={styles.googleLogin}>
          <GoogleLogin
            onSuccess={response => {
              login(response);
              navigate("/dashboard");
            }}
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
  },
};

export default Login;
