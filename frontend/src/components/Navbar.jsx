import { LuCalendar } from 'react-icons/lu';
import '../styles/Navbar.css';

const Navbar = () => {
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="navbar">
      <div className="navbar-left">
        <img src="/logo.svg" alt="Poketrako" className="navbar-logo" />
        <h1>Poketrako</h1>
      </div>
      <div className="navbar-right">
        <span className="navbar-date"><LuCalendar /> {today}</span>
      </div>
    </div>
  );
};

export default Navbar;
