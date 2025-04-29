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
import { useState, useEffect } from "react";
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

const { Header } = Layout;

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();

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
            {/* Logo that links to home */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <Link to="/">
                <img
                  src={logoImage}
                  alt="Logo"
                  style={{ height: "90px", padding: "0", cursor: "pointer" }}
                />
              </Link>
            </div>

            {/* Menu items, centered horizontally */}
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

            {/* Right Side of menu with profile icon */}
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

      {contextHolder}
      <NewEventListener notifyApi={api}/>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/update" element={<UpdateProfile />} />
        <Route path="/eventspage" element={<EventsPage />} />
        <Route path="/hostevent" element={<HostEvent />} />
        <Route path="/eventdetail" element={<EventDetailPage />} />
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
