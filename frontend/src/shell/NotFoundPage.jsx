import { Link } from 'react-router-dom';
import { LuHouse, LuCompass } from 'react-icons/lu';
import { Button, Card } from '../components/ui';
import './AppShell.css';

/**
 * NotFoundPage — a real 404 instead of a bare paragraph, with a way back that
 * respects the session state.
 */

const NotFoundPage = () => {
  const token = localStorage.getItem('token');

  return (
    <main className="notfound">
      <Card className="notfound__card">
        <span className="state__icon" aria-hidden="true">
          <LuCompass />
        </span>
        <p className="notfound__code">404</p>
        <h1 className="notfound__title">Cette page n’existe pas</h1>
        <p className="notfound__text">
          Le lien est peut-être obsolète, ou l’adresse contient une faute de frappe.
        </p>
        <div className="notfound__actions">
          <Link to={token ? '/dashboard' : '/login'} className="btn btn--primary btn--md">
            <LuHouse className="btn__icon" aria-hidden="true" />
            <span className="btn__label">{token ? 'Retour au tableau de bord' : 'Aller à la connexion'}</span>
          </Link>
          <Button variant="secondary" onClick={() => window.history.back()}>
            Revenir en arrière
          </Button>
        </div>
      </Card>
    </main>
  );
};

export default NotFoundPage;
