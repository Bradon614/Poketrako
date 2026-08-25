import React, { useEffect, useState } from 'react';
import { getBudgetAlert } from '../api';


const BudgetAlert = () => {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const data = await getBudgetAlert();
        if (data.alert) setAlert(data.message);
      } catch (err) {
        console.error("Erreur alerte budget :", err);
      }
    };
    fetchAlert();
  }, []);

  if (!alert) return null;

  return (
    <div className="budget-alert">
      ⚠️ {alert}
    </div>
  );
};

export default BudgetAlert;
