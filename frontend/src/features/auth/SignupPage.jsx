import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuUser, LuMail, LuLock, LuUserPlus, LuCircleCheck } from 'react-icons/lu';
import AuthLayout from './AuthLayout';
import { Button, Input } from '../../components/ui';
import { login, signup } from '../../api';
import { useToast } from '../../lib/toast';
import './Auth.css';

/**
 * SignupPage — full name (optional) + email + password + confirmation.
 *
 * Signing up then signs the user straight in (same flow as before) so they
 * land on their dashboard rather than being bounced back to a login form.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const SignupPage = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const passwordChecks = [
    { label: `${MIN_PASSWORD_LENGTH} caractères minimum`, ok: password.length >= MIN_PASSWORD_LENGTH },
    { label: 'Les deux mots de passe correspondent', ok: password.length > 0 && password === confirmation },
  ];

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = 'Renseignez une adresse e-mail';
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Cette adresse e-mail semble invalide';
    if (password.length < MIN_PASSWORD_LENGTH) next.password = `Au moins ${MIN_PASSWORD_LENGTH} caractères`;
    if (password !== confirmation) next.confirmation = 'Les mots de passe ne correspondent pas';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await signup(email.trim(), password, fullName.trim() || undefined);
      await login(email.trim(), password);
      success('Votre compte est prêt. Bienvenue !');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err?.message || "Impossible de créer le compte";
      setFormError(message);
      toastError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Quelques secondes suffisent pour commencer."
      variant="signup"
      footer={
        <p className="auth__switch">
          Déjà inscrit ?{' '}
          <Link to="/login" className="auth__switch-link">
            Se connecter
          </Link>
        </p>
      }
    >
      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        <Input
          label="Nom complet (optionnel)"
          type="text"
          name="fullName"
          autoComplete="name"
          placeholder="Jean Rakoto"
          icon={LuUser}
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          disabled={submitting}
        />

        <Input
          label="Adresse e-mail"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="vous@exemple.com"
          icon={LuMail}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          disabled={submitting}
        />

        <Input
          label="Mot de passe"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="••••••••"
          icon={LuLock}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          disabled={submitting}
        />

        <Input
          label="Confirmer le mot de passe"
          type="password"
          name="confirmation"
          autoComplete="new-password"
          placeholder="••••••••"
          icon={LuLock}
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          error={errors.confirmation}
          disabled={submitting}
        />

        <ul className="auth__checks">
          {passwordChecks.map((check) => (
            <li key={check.label} className={check.ok ? 'is-ok' : ''}>
              <LuCircleCheck aria-hidden="true" />
              {check.label}
            </li>
          ))}
        </ul>

        {formError && (
          <p className="auth__error" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" fullWidth icon={LuUserPlus} loading={submitting}>
          {submitting ? 'Création…' : 'Créer mon compte'}
        </Button>

        <p className="auth__legal">
          En créant un compte, vous acceptez que vos données financières soient stockées dans votre
          espace personnel Poketrako.
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;
