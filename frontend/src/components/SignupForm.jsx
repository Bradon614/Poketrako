import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup, login } from '../api';

const SignupForm = ({ onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
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
      await signup(email, password, fullName || undefined);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="field"
          type="text"
          placeholder="Nom complet"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
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
          placeholder="Mot de passe (8 caractères min.)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'INSCRIPTION…' : "S'INSCRIRE"}
        </button>
        <p>
          Déjà un compte ?{' '}
          <button type="button" className="link-btn" onClick={onSwitchToLogin}>Connexion</button>
        </p>
      </form>
    </>
  );
};

export default SignupForm;
