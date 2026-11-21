import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LuMail, LuLock, LuEye, LuEyeOff, LuLogIn } from 'react-icons/lu';
import AuthLayout from './AuthLayout';
import { Button, Input } from '../../components/ui';
import { login } from '../../api';
import { useToast } from '../../lib/toast';
import '../../design/glass.css';
import './Auth.css';

/**
 * LoginPage — email + password.
 *
 * Preserves the previous behaviour (store the JWT, then go to the dashboard)
 * and adds two things it lacked: the redirect target is validated before use,
 * and the password can be revealed to check a typo.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { error: toastError } = useToast();

  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const passwordRef = useRef(null);

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = 'Renseignez votre adresse e-mail';
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Cette adresse e-mail semble invalide';
    if (!password) next.password = 'Renseignez votre mot de passe';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      // Only same-origin paths are honoured (never an absolute URL).
      const requested = new URLSearchParams(location.search).get('redirect');
      const target = requested && requested.startsWith('/') ? requested : '/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      const message = err?.message || 'Connexion impossible';
      setFormError(message);
      toastError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Connexion"
      subtitle="Accédez à votre espace financier."
      variant="login"
      footer={
        <p className="auth__switch">
          Pas encore de compte ?{' '}
          <Link to="/signup" className="auth__switch-link">
            Créer un compte
          </Link>
        </p>
      }
    >
      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        <Input
          label="Adresse e-mail"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="vous@exemple.com"
          icon={LuMail}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => email && !EMAIL_PATTERN.test(email.trim()) && setErrors((e) => ({ ...e, email: 'Cette adresse e-mail semble invalide' }))}
          error={errors.email}
          disabled={submitting}
        />

        <Input
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          icon={LuLock}
          ref={passwordRef}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          disabled={submitting}
        />

        <label className="auth__reveal">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(event) => setShowPassword(event.target.checked)}
          />
          {showPassword ? <LuEyeOff aria-hidden="true" /> : <LuEye aria-hidden="true" />}
          Afficher le mot de passe
        </label>

        {formError && (
          <p className="auth__error" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" fullWidth icon={LuLogIn} loading={submitting}>
          {submitting ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
