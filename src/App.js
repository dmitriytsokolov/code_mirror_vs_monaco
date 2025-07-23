import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import CodeMirrorPage from './pages/CodeMirrorPage';
import MonacoPage from './pages/MonacoPage';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="nav">
      <ul className="nav-list">
        <li className="nav-item">
          <Link 
            to="/codemirror" 
            className={`nav-link ${location.pathname === '/codemirror' ? 'active' : ''}`}
          >
            CodeMirror
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            to="/monaco" 
            className={`nav-link ${location.pathname === '/monaco' ? 'active' : ''}`}
          >
            Monaco
          </Link>
        </li>
      </ul>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="container">
        <Navigation />
        <Routes>
          <Route path="/" element={<CodeMirrorPage />} />
          <Route path="/codemirror" element={<CodeMirrorPage />} />
          <Route path="/monaco" element={<MonacoPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 