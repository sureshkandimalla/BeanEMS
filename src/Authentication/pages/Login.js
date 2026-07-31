import React, { useContext } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { message } from "antd";
import AuthContext from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Must match ProtectedRoute's check exactly (presence of a token, not just
  // a truthy user object) — otherwise a stale/malformed localStorage "user"
  // entry with no token sends this into an infinite redirect loop with
  // ProtectedRoute bouncing straight back to "/" ("Maximum update depth
  // exceeded").
  const isAuthenticated = Boolean(user?.token);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null; // Already logged in, skip login UI
  }

  const handleSuccess = async (response) => {
    try {
      await login(response);
      navigate("/dashboard");
    } catch (error) {
      const reason =
        error.response?.data?.error ||
        "Sign-in failed. Please try again.";
      message.error(reason);
    }
  };

  return (
    <div>
      <div style={styles.loginBox}>
        <div style={styles.googleLogin}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => message.error("Login Failed")}
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
