import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import { Layout, Menu, Dropdown, Avatar, Button } from "antd";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import NewEventListener from "./notifications/NewEventListener.tsx";
import { notification } from "antd";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import UpdateProfile from "./pages/UpdateProfile.tsx";
import EventsPage from "./pages/EventsPage.tsx";
import HostEvent from "./pages/HostEvent.tsx";
import EventDetailPage from "./pages/EventDetailPage.tsx";
import logoImage from "/src/assets/sparkBytes_teal_white_text_shadow 1.png";
import HostApplicationPage from "./pages/HostApplicationPage.tsx";

const { Header } = Layout;

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();
  const hasMountedRef = useRef(false);

  useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const profileMenu = (
    <Menu>
      <Menu.Item
        key="profile"
        icon={<SettingOutlined />}
        onClick={() => navigate("/profile")}
      >
        Profile Settings
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Log Out
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <header>
        <nav>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingLeft: "1vw",
              paddingRight: "3vw",
              height: "80px",
            }}
          >
            {/* Logo that links to Home */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <Link to="/">
                <img
                  src={logoImage}
                  alt="Logo"
                  style={{ height: "90px", padding: "0", cursor: "pointer" }}
                />
              </Link>
            </div>

            {/* Menu Items, Centered Horizontally */}
            <Menu
              mode="horizontal"
              style={{
                background: "transparent",
                flex: 1,
                justifyContent: "center",
                borderBottom: "none",
                marginRight: "80px"
              }}
            >
              <Menu.Item key="home" style={{ margin: "0 20px" }}>
                <Link
                  to="/"
                  style={{
                    color: "white",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  Home
                </Link>
              </Menu.Item>
              <Menu.Item key="events" style={{ margin: "0 20px" }}>
                <Link
                  to="/eventspage"
                  style={{
                    color: "white",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  Events
                </Link>
              </Menu.Item>
              <Menu.Item key="about" style={{ margin: "0 20px" }}>
                <Link
                  to="/about"
                  style={{
                    color: "white",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  About
                </Link>
              </Menu.Item>
            </Menu>

            {/* Right Side of Menu with Profile Icon */}
            <div style={{ display: "flex", alignItems: "center" }}>
              {user ? (
                <Dropdown
                  overlay={profileMenu}
                  placement="bottomRight"
                  trigger={["click"]}
                >
                  <Avatar
                    size="large"
                    icon={<UserOutlined />}
                    style={{
                      cursor: "pointer",
                      backgroundColor: "#169E89",
                    }}
                  />
                </Dropdown>
              ) : (
                <Button
                  type="primary"
                  icon={<LoginOutlined />}
                  style={{
                    backgroundColor: "#169E89",
                    borderColor: "#169E89",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                  onClick={() => navigate("/profile")}
                >
                  Sign In / Register
                </Button>
              )}
            </div>
          </div>
        </nav>
      </header>
      
      {/* Footer with matching navbar gradient and social media for community outreach*/}
      <footer>
        <div className="footer-content">
          <div>
            © {new Date().getFullYear()} SparkBytes. All rights reserved.
          </div>
          <div className="social-links">
            <a href="#" aria-label="Facebook">
              <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 1024 1024">
              <path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-92.4 233.5h-63.9c-50.1 0-59.8 23.8-59.8 58.8v77.1h119.6l-15.6 120.7h-104V912H539.2V602.2H434.9V481.4h104.3v-89c0-103.3 63.1-159.6 155.3-159.6 44.2 0 82.1 3.3 93.2 4.8v107.9z" />
              </svg>
            </a>
            <a href="#" aria-label="Twitter">
              <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 1024 1024">
              <path d="M928 254.3c-30.6 13.2-63.9 22.7-98.2 26.4a170.1 170.1 0 0 0 75-94 336.64 336.64 0 0 1-108.2 41.2A170.1 170.1 0 0 0 672 174c-94.5 0-170.5 76.6-170.5 170.6 0 13.2 1.6 26.4 4.2 39.1-141.5-7.4-267.7-75-351.6-178.5a169.32 169.32 0 0 0-23.2 86.1c0 59.2 30.1 111.4 76 142.1a172 172 0 0 1-77.1-21.7v2.1c0 82.9 58.6 151.6 136.7 167.4a180.6 180.6 0 0 1-44.9 5.8c-11.1 0-21.6-1.1-32.2-2.6C211 652 273.9 701.1 348.8 702.7c-58.6 45.9-132 72.9-211.7 72.9-14.3 0-27.5-.5-41.2-2.1C171.5 822 261.2 850 357.8 850 671.4 850 843 597.7 843 376.6c0-7.4 0-14.8-.5-22.2 33.2-24.3 62.3-54.4 85.5-88.2z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram"></a>
              <svg width="1em" height="1.5em" fill="currentColor" viewBox="0 0 1024 1024">
              <path d="M512 306.9c-113.5 0-205.1 91.6-205.1 205.1S398.5 717.1 512 717.1 717.1 625.5 717.1 512 625.5 306.9 512 306.9zm0 338.4c-73.4 0-133.3-59.9-133.3-133.3S438.6 378.7 512 378.7 645.3 438.6 645.3 512 585.4 645.3 512 645.3zm213.5-394.6c-26.5 0-47.9 21.4-47.9 47.9s21.4 47.9 47.9 47.9 47.9-21.3 47.9-47.9a47.84 47.84 0 0 0-47.9-47.9zM911.8 512c0-55.2.5-109.9-2.6-165-3.1-64-17.7-120.8-64.5-167.6-46.9-46.9-103.6-61.4-167.6-64.5-55.2-3.1-109.9-2.6-165-2.6-55.2 0-109.9-.5-165 2.6-64 3.1-120.8 17.7-167.6 64.5C132.6 226.3 118.1 283 115 347c-3.1 55.2-2.6 109.9-2.6 165s-.5 109.9 2.6 165c3.1 64 17.7 120.8 64.5 167.6 46.9 46.9 103.6 61.4 167.6 64.5 55.2 3.1 109.9 2.6 165 2.6 55.2 0 109.9.5 165-2.6 64-3.1 120.8-17.7 167.6-64.5 46.9-46.9 61.4-103.6 64.5-167.6 3.2-55.1 2.6-109.8 2.6-165zm-88 235.8c-7.3 18.2-16.1 31.8-30.2 45.8-14.1 14.1-27.6 22.9-45.8 30.2C695.2 844.7 570.3 840 512 840c-58.3 0-183.3 4.7-235.9-16.1-18.2-7.3-31.8-16.1-45.8-30.2-14.1-14.1-22.9-27.6-30.2-45.8C179.3 695.2 184 570.3 184 512c0-58.3-4.7-183.3 16.1-235.9 7.3-18.2 16.1-31.8 30.2-45.8s27.6-22.9 45.8-30.2C328.7 179.3 453.7 184 512 184s183.3-4.7 235.9 16.1c18.2 7.3 31.8 16.1 45.8 30.2 14.1 14.1 22.9 27.6 30.2 45.8C844.7 328.7 840 453.7 840 512c0 58.3 4.7 183.2-16.2 235.8z" />
            </svg>

          </div>
        </div>
      </footer>

      {contextHolder}
      {hasMountedRef.current && <NewEventListener notifyApi={api} />}

      <Routes> 
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/update" element={<UpdateProfile />} />
        <Route path="/eventspage" element={<EventsPage />} />
        <Route path="/hostevent" element={<HostEvent />} />
        <Route path="/eventdetail" element={<EventDetailPage />} />
        <Route path="/hostapplication" element={<HostApplicationPage />} />
      </Routes>
    </>

  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
