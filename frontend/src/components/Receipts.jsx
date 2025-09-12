import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Receipts.css';

const Receipts = ({ idExpense, token }) => {
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await axios.get(`/api/expenses/receipt/${idExpense}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReceipt(res.data);
      } catch (err) {
        console.error('Erreur justificatif :', err);
      }
    };

    fetchReceipt();
  }, [idExpense, token]);

  if (!receipt) return <p>Aucun justificatif trouvé.</p>;

  const fileUrl = `/uploads/${receipt.url}`;

  return (
    <div className="receipt-preview">
      <h3>Justificatif</h3>
      {receipt.contentType.includes('image') ? (
        <img src={fileUrl} alt="Justificatif" style={{ maxWidth: '100%', borderRadius: '8px' }} />
      ) : (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          📄 Voir le fichier PDF
        </a>
      )}
    </div>
  );
};

const handleDelete = async () => {
  if (!receipt) return;
  try {
    await axios.delete(`/api/receipts/${receipt.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert('✅ Justificatif supprimé');
    setReceipt(null);
  } catch (err) {
    console.error('Erreur suppression :', err);
    alert('❌ Échec de la suppression');
  }
};

<button onClick={handleDelete} style={{ marginTop: '10px' }}>
  🗑️ Supprimer le justificatif
</button>


export default Receipts;
