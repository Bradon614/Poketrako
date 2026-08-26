import { useNavigate } from 'react-router-dom';
import { LuCalendar, LuLogOut } from 'react-icons/lu';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <header className="navbar">
      {/* Only shown under 768px, where the sidebar turns into a bottom bar
          and loses its own logo/brand header. */}
      <div className="navbar-brand">
        <img src="/logo.svg" alt="" className="navbar-logo" />
        <span>Poketrako</span>
      </div>

      <span className="navbar-date"><LuCalendar /> {today}</span>

      {/* The label is hidden on mobile, so the name has to come from aria-label. */}
      <button className="navbar-logout" onClick={handleLogout} aria-label="Déconnexion">
        <LuLogOut />
        <span>Déconnexion</span>
      </button>
    </header>
  );
};

export default Navbar;
