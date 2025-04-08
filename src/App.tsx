import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';


import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import UpdateProfile from "./pages/UpdateProfile.tsx";
import EventsPage from "./pages/EventsPage.tsx";
import HostEvent from "./pages/HostEvent.tsx";
import EventDetailPage from "./pages/EventDetailPage.tsx";

function App() {
  return (
      <Router>
          <header>
              <nav>
                  <ul className="navbar">
                      <li><Link to="/">Home</Link></li>
                      <li><Link to="/about">About</Link></li>
                      <li><Link to="/contact">Contact</Link></li>
                      <li><Link to="/profile">Profile</Link></li>
                      <li><Link to="/eventspage">Events</Link></li>
                  </ul>
              </nav>
          </header>

          <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/about" element={<About/>}/>
              <Route path="/contact" element={<Contact/>}/>
              <Route path="/profile" element={<Profile/>}/>
              <Route path="/update" element={<UpdateProfile/>}/>
              <Route path="/eventspage" element={<EventsPage/>}/>
              <Route path="/hostevent" element={<HostEvent/>}/>
              <Route path="/eventdetail" element={<EventDetailPage />} />
          </Routes>
      </Router>
  )
}

export default App
