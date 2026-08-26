import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import '../styles/AuthCard.css';

// A single card that flips in 3D between the login and signup forms instead
// of navigating to a different page — the URL can still change (for direct
// links/bookmarks) but the flip itself is a pure in-place animation.
const AuthCard = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const flipped = mode === 'signup';

  return (
    <div className="auth-card-scene">
      <div className={`auth-card ${flipped ? 'flipped' : ''}`}>
        <div className="auth-card-face auth-card-front">
          <LoginForm onSwitchToSignup={() => setMode('signup')} />
        </div>
        <div className="auth-card-face auth-card-back">
          <SignupForm onSwitchToLogin={() => setMode('login')} />
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
