import React, { useEffect, useState } from 'react';
import { getBudgetAlert } from '../api/index.js';


const BudgetAlert = ({ token }) => {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const data = await getBudgetAlert(token);
        if (data.alert) setAlert(data.message);
      } catch (err) {
        console.error("Erreur alerte budget :", err);
      }
    };
    fetchAlert();
  }, [token]);

  if (!alert) return null;

  return (
    <div className="budget-alert">
      ⚠️ {alert}
    </div>
  );
};

export default BudgetAlert;
