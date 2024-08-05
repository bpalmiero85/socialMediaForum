import React from "react";
import { useCookies } from "react-cookie";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import UserInfo from "./pages/UserInfoPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import LogoutPage from "./pages/LogoutPage";
import RegisterPage from "./pages/RegisterPage";
import WelcomePage from "./pages/WelcomePage";
import VerificationPage from "./pages/VerificationPage";
import ActiveUsers from "./components/ActiveUsers";
import Navbar from "./components/Navbar";

const App = () => {
  const [cookies] = useCookies(["user"]);
  const isVerified = cookies.user ? true : false;
  const location = useLocation();
  const hideNavbar = ["/register", "/", "/active-users"];

  return (
    <div>
      {!hideNavbar.includes(location.pathname) && <Navbar />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerificationPage />} />
        <Route path="/userinfo" element={<UserInfo />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/active-users" element={<ActiveUsers />} />
        <Route path="/homepage" element={<HomePage />} />

        {isVerified ? (
          <Route path="/welcome" element={<WelcomePage />} />
        ) : (
          <Route path="/register" element={<RegisterPage />} />
        )}
      </Routes>
    </div>
  );
};

const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default AppWrapper;
