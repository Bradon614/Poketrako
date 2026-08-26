import { useState } from 'react';
import { LuCoins } from 'react-icons/lu';
import { updateCurrency } from '../api';
import { useCurrency } from '../context/CurrencyContext';
import { SUPPORTED_CURRENCIES } from '../currency';
import '../styles/CurrencySettings.css';

const CurrencySettings = () => {
  const { currency, setCurrency } = useCurrency();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = async (e) => {
    const next = e.target.value;
    setError('');
    setSaving(true);
    try {
      await updateCurrency(next);
      setCurrency(next);
    } catch (err) {
      setError(err.message || 'Erreur lors du changement de devise');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="currency-settings card">
      <div className="currency-settings-header">
        <LuCoins />
        <span>Devise</span>
      </div>
      <select className="field" value={currency} onChange={handleChange} disabled={saving}>
        {SUPPORTED_CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>{c.label}</option>
        ))}
      </select>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export default CurrencySettings;
