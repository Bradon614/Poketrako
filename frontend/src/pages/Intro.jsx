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
          <h1>Welcome to Poketrako</h1>
          <p>Poketrako is a web-based financial management platform</p>
          <p>designed to help users monitor their spending and take control of their personal finances with clarity and ease.</p>

          <div className="floating-decor" aria-hidden="true">
            <div className="floating-balance-card card">
              <span className="floating-balance-label">Solde total</span>
              <span className="floating-balance-amount">3 250 000 Ar</span>
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
