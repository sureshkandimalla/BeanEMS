import React, { useContext } from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";
import AuthContext from "../Context/AuthContext";
import { getLandingPage } from "../../Utils/roleAccess";

// Shown by MainLayout's role gate (see roleAccess.js) both when a logged-in
// user's role doesn't cover the current page, and when they have no role
// assigned yet (a new hire who's logged in but an Admin hasn't granted
// access) — canAccess() returns false for a null role too, so this same
// screen covers both cases.
const AccessDenied = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const subTitle = user?.role
    ? "You don't have access to this page. Contact your Administrator if you think this is a mistake."
    : "Your account hasn't been granted access yet. Contact your Administrator to get a role assigned.";

  return (
    <Result
      status="403"
      title="Access Denied"
      subTitle={subTitle}
      extra={
        <Button type="primary" onClick={() => navigate(getLandingPage(user?.role))}>
          Back to Home
        </Button>
      }
    />
  );
};

export default AccessDenied;
