import React from 'react';
import '../styles/Navbar.css';

const Navbar = ({ onLogout }) => {
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="navbar">
      <div className="navbar-left">
    
      </div>
      <div className="navbar-right">
        
        <span className="navbar-date">📅 {today}</span>
        <h1>Poketrako</h1>
      </div>
    </div>
  );
};

export default Navbar;
