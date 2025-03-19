import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';


import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';


function App() {
  return (
      <Router>
          <nav>
              <ul className="navbar">
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/about">About</Link></li>
                  <li><Link to="/contact">Contact</Link></li>
                  <li><Link to="/profile">Profile</Link></li>
              </ul>
          </nav>

          <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/about" element={<About/>}/>
              <Route path="/contact" element={<Contact/>}/>
              <Route path="/profile" element={<Profile/>}/>
          </Routes>
      </Router>
  )
}

export default App
