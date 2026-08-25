import { useEffect, useState } from 'react';
import { API_URL, authHeaders } from '../api';
import '../styles/Receipts.css';

const Receipts = ({ idExpense }) => {
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await fetch(`${API_URL}/expenses/receipt/${idExpense}`, {
          headers: authHeaders()
        });
        if (!res.ok) throw new Error(`Requête échouée (${res.status})`);
        setReceipt(await res.json());
      } catch (err) {
        console.error('Erreur justificatif :', err);
      }
    };

    fetchReceipt();
  }, [idExpense]);

  const handleDelete = async () => {
    if (!receipt) return;
    try {
      const res = await fetch(`${API_URL}/receipts/${receipt.id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (!res.ok) throw new Error(`Requête échouée (${res.status})`);
      setReceipt(null);
    } catch (err) {
      console.error('Erreur suppression :', err);
    }
  };

  if (!receipt) return <p>Aucun justificatif trouvé.</p>;

  const fileUrl = `/uploads/${receipt.url}`;

  return (
    <div className="receipt-preview">
      <h3>Justificatif</h3>
      {receipt.contentType?.includes('image') ? (
        <img src={fileUrl} alt="Justificatif" style={{ maxWidth: '100%', borderRadius: '8px' }} />
      ) : (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          Voir le fichier PDF
        </a>
      )}
      <button onClick={handleDelete} style={{ marginTop: '10px' }}>
        Supprimer le justificatif
      </button>
    </div>
  );
};

export default Receipts;
