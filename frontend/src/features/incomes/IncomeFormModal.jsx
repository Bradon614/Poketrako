import { useEffect, useState } from 'react';
import { LuBanknote, LuCalendar, LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu';
import { Button, FieldRow, Input, Modal, Textarea, useConfirm } from '../../components/ui';
import { createIncome, deleteIncome, updateIncome } from '../../api';
import { useToast } from '../../lib/toast';
import { toISODate } from '../../lib/dates';
import '../expenses/forms.css';

/**
 * IncomeFormModal — create and edit an income.
 * Same shape as the expense modal so both flows feel identical.
 */

const emptyForm = () => ({
  amount: '',
  date: toISODate(new Date()),
  source: '',
  description: '',
});

export default function IncomeFormModal({ open, income, currency, onClose, onSaved }) {
  const confirm = useConfirm();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isEdit = Boolean(income?.id);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (income) {
      setForm({
        amount: String(Number(income.amount) || ''),
        date: income.date ? toISODate(income.date) : toISODate(new Date()),
        source: income.source || '',
        description: income.description || '',
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, income]);

  const setField = (key) => (event) => {
    const value = event?.target ? event.target.value : event;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = () => {
    const next = {};
    const amount = Number(String(form.amount).replace(',', '.'));
    if (!amount || amount <= 0) next.amount = 'Le montant doit être supérieur à zéro';
    if (!form.date) next.date = 'La date est requise';
    if (!form.source.trim()) next.source = 'La source est requise (salaire, vente, mission…)';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        amount: Number(String(form.amount).replace(',', '.')),
        date: form.date,
        source: form.source.trim(),
        description: form.description.trim() || undefined,
      };

      if (isEdit) await updateIncome(income.id, payload);
      else await createIncome(payload);

      success(isEdit ? 'Revenu mis à jour.' : 'Revenu ajouté.');
      onSaved?.();
      onClose();
    } catch (error) {
      toastError(error?.message || "Impossible d'enregistrer le revenu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Supprimer le revenu',
      message: 'Ce revenu sera définitivement supprimé de votre historique.',
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    if (!confirmed) return;

    setSubmitting(true);
    try {
      await deleteIncome(income.id);
      success('Revenu supprimé.');
      onSaved?.();
      onClose();
    } catch (error) {
      toastError(error?.message || 'Impossible de supprimer le revenu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifier le revenu' : 'Nouveau revenu'}
      description={isEdit ? 'Ajustez les informations puis enregistrez.' : 'Indiquez le montant et la source.'}
      size="sm"
      footer={
        <>
          {isEdit && (
            <Button variant="danger" icon={LuTrash2} onClick={handleDelete} disabled={submitting} className="modal__footer-delete">
              Supprimer
            </Button>
          )}
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button variant="primary" icon={isEdit ? LuPencil : LuPlus} loading={submitting} onClick={handleSubmit}>
            {isEdit ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </>
      }
    >
      <form className="modal-form" onSubmit={handleSubmit} noValidate>
        <FieldRow columns={2}>
          <Input
            label="Montant"
            name="amount"
            inputMode="decimal"
            placeholder="0"
            icon={LuBanknote}
            suffix={currency}
            value={form.amount}
            onChange={setField('amount')}
            error={errors.amount}
            autoFocus={!isEdit}
          />
          <Input
            label="Date"
            name="date"
            type="date"
            icon={LuCalendar}
            value={form.date}
            onChange={setField('date')}
            error={errors.date}
          />
        </FieldRow>

        <Input
          label="Source"
          name="source"
          placeholder="Salaire, freelance, vente…"
          value={form.source}
          onChange={setField('source')}
          error={errors.source}
          maxLength={120}
        />

        <Textarea
          label="Description"
          name="description"
          placeholder="Optionnel"
          rows={2}
          value={form.description}
          onChange={setField('description')}
        />
      </form>
    </Modal>
  );
}
