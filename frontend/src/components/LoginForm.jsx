import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuMail } from 'react-icons/lu';
import { login } from '../api';

const LoginForm = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="login">Connexion</h1>
      <form onSubmit={handleSubmit}>
        <LuMail />
        <input
          className="field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="field"
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="form-error">{error}</p>}
        <a href="#" className="forgot-password">Mot de passe oublié ?</a>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'CONNEXION…' : 'CONNEXION'}
        </button>
        <p>
          Pas encore de compte ?{' '}
          <button type="button" className="link-btn" onClick={onSwitchToSignup}>S'inscrire</button>
        </p>
      </form>
    </>
  );
};

export default LoginForm;
