import { LuTrendingUp } from 'react-icons/lu';
import AuthCard from '../components/AuthCard';
import '../styles/intro.css';

export default function Intro({ initialMode = 'login' }) {
  return (
    <div className="bigbody">
      <div className="bodyIntro">
        <div className="nav">
          <img src="/logo.svg" alt="Poketrako" className="logo" />
          <h2>Poketrako</h2>
        </div>
        <div className="text">
          <h1>Bienvenue sur Poketrako</h1>
          <p>Poketrako est une plateforme de gestion financière en ligne</p>
          <p>conçue pour vous aider à suivre vos dépenses et prendre le contrôle de vos finances personnelles, simplement et clairement.</p>

          <div className="floating-decor" aria-hidden="true">
            <div className="floating-balance-card card">
              <span className="floating-balance-label">Solde total</span>
              <LuTrendingUp />
            </div>
            <div className="floating-badge badge-ar"><span>Ar</span></div>
            <div className="floating-badge badge-eur"><span>€</span></div>
            <div className="floating-badge badge-usd"><span>$</span></div>
            <div className="floating-badge badge-gbp"><span>£</span></div>
          </div>
        </div>
      </div>

      <div className="Logincontainer">
        <AuthCard initialMode={initialMode} />
      </div>
    </div>
  );
}
