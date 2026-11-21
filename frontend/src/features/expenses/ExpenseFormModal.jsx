import { useEffect, useMemo, useRef, useState } from 'react';
import { LuCalendar, LuCircleDollarSign, LuPlus, LuTrash2, LuUpload, LuPencil } from 'react-icons/lu';
import {
  Button,
  FieldRow,
  Input,
  Modal,
  SegmentedControl,
  Select,
  Textarea,
  useConfirm,
} from '../../components/ui';
import { createExpense, deleteExpense, deleteReceipt, updateExpense, uploadReceipt } from '../../api';
import { useToast } from '../../lib/toast';
import { toISODate } from '../../lib/dates';
import { ReceiptHint } from '../transactions/TransactionRow';

/**
 * ExpenseFormModal — create and edit an expense, including its receipt.
 *
 * Used by the dashboard, the expenses list and the /expenses/new route, so the
 * expense workflow (amount, date, category, description, one-off vs recurring,
 * receipt upload/replace/delete) exists in exactly one place.
 *
 * Field validation mirrors the API rules (positive amount, ISO date, end date
 * after start date for recurring expenses) — the backend stays the authority,
 * this only avoids a round-trip for obvious mistakes.
 */

const TYPE_OPTIONS = [
  { value: 'ONE_TIME', label: 'Ponctuelle' },
  { value: 'RECURRING', label: 'Récurrente' },
];

const MAX_RECEIPT_BYTES = 1024 * 1024;

const emptyForm = () => ({
  amount: '',
  date: toISODate(new Date()),
  categoryId: '',
  description: '',
  type: 'ONE_TIME',
  startDate: toISODate(new Date()),
  endDate: '',
});

export default function ExpenseFormModal({ open, expense, categories = [], currency, onClose, onSaved }) {
  const confirm = useConfirm();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [removeReceipt, setRemoveReceipt] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const isEdit = Boolean(expense?.id);

  // Reset the form whenever the modal opens (or targets another expense).
  useEffect(() => {
    if (!open) return;
    setErrors({});
    setFile(null);
    setRemoveReceipt(false);
    if (expense) {
      setForm({
        amount: String(Number(expense.amount) || ''),
        date: expense.date ? toISODate(expense.date) : toISODate(expense.creationDate),
        categoryId: expense.categoryId ? String(expense.categoryId) : '',
        description: expense.description || '',
        type: expense.type || 'ONE_TIME',
        startDate: expense.startDate ? toISODate(expense.startDate) : toISODate(new Date()),
        endDate: expense.endDate ? toISODate(expense.endDate) : '',
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, expense]);

  const setField = (key) => (event) => {
    const value = event?.target ? event.target.value : event;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = () => {
    const next = {};
    const amount = Number(String(form.amount).replace(',', '.'));
    if (!amount || amount <= 0) next.amount = 'Le montant doit être supérieur à zéro';
    if (!form.date) next.date = 'La date est requise';
    if (form.type === 'RECURRING') {
      if (!form.startDate) next.startDate = 'La date de début est requise';
      if (form.endDate && form.startDate && form.endDate <= form.startDate) {
        next.endDate = 'La date de fin doit être postérieure à la date de début';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleFile = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (selected.size > MAX_RECEIPT_BYTES) {
      toastError('Le justificatif dépasse la taille maximale de 1 Mo.');
      event.target.value = '';
      return;
    }
    setFile(selected);
    setRemoveReceipt(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        amount: Number(String(form.amount).replace(',', '.')),
        date: form.type === 'ONE_TIME' ? form.date || undefined : form.startDate || form.date || undefined,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        description: form.description.trim() || undefined,
        type: form.type,
        startDate: form.type === 'RECURRING' ? form.startDate || undefined : undefined,
        endDate: form.type === 'RECURRING' ? form.endDate || undefined : undefined,
      };

      const saved = isEdit
        ? (await updateExpense(expense.id, payload), expense.id)
        : (await createExpense(payload)).id;

      /* Receipt handling — only for one-off expenses, as the API expects. */
      if (isEdit && removeReceipt && expense.receiptUpload) {
        await deleteReceipt(saved);
      }
      if (file && form.type === 'ONE_TIME') {
        try {
          await uploadReceipt(saved, file);
        } catch (uploadError) {
          // The expense itself is saved: report the partial failure instead of
          // pretending everything worked.
          toastError(`Dépense enregistrée, mais le justificatif n'a pas pu être envoyé : ${uploadError.message}`);
        }
      }

      success(isEdit ? 'Dépense mise à jour.' : 'Dépense ajoutée.');
      onSaved?.();
      onClose();
    } catch (error) {
      toastError(error?.message || "Impossible d'enregistrer la dépense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Supprimer la dépense',
      message: 'Cette dépense sera définitivement supprimée de votre historique.',
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    if (!confirmed) return;

    setSubmitting(true);
    try {
      await deleteExpense(expense.id);
      success('Dépense supprimée.');
      onSaved?.();
      onClose();
    } catch (error) {
      toastError(error?.message || 'Impossible de supprimer la dépense');
    } finally {
      setSubmitting(false);
    }
  };

  const receiptToShow = useMemo(
    () => (!removeReceipt && expense?.receiptUpload ? expense.receiptUpload : null),
    [expense, removeReceipt]
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifier la dépense' : 'Nouvelle dépense'}
      description={
        isEdit
          ? 'Ajustez les informations puis enregistrez.'
          : 'Renseignez le montant, la date et la catégorie.'
      }
      size="md"
      footer={
        <>
          {isEdit && (
            <Button
              variant="danger"
              icon={LuTrash2}
              onClick={handleDelete}
              disabled={submitting}
              className="modal__footer-delete"
            >
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
            icon={LuCircleDollarSign}
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
            disabled={form.type === 'RECURRING'}
            hint={form.type === 'RECURRING' ? 'Utilisez la date de début ci-dessous' : undefined}
          />
        </FieldRow>

        <Select
          label="Catégorie"
          name="categoryId"
          value={form.categoryId}
          onChange={setField('categoryId')}
          hint="Sans catégorie, la description sert de titre."
        >
          <option value="">Sans catégorie</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>

        <Textarea
          label="Description"
          name="description"
          placeholder="Optionnel — précisez la dépense"
          rows={2}
          value={form.description}
          onChange={setField('description')}
        />

        <div className="modal-form__group">
          <span className="modal-form__label">Type de dépense</span>
          <SegmentedControl
            options={TYPE_OPTIONS}
            value={form.type}
            onChange={(value) => setForm((current) => ({ ...current, type: value }))}
            label="Type de dépense"
            className="segmented--keep-labels"
          />
        </div>

        {form.type === 'RECURRING' && (
          <FieldRow columns={2} className="modal-form__recurring">
            <Input
              label="Première occurrence"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={setField('startDate')}
              error={errors.startDate}
              hint="Une occurrence est créée chaque mois"
            />
            <Input
              label="Fin (optionnel)"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={setField('endDate')}
              error={errors.endDate}
              hint="12 mois par défaut"
            />
          </FieldRow>
        )}

        {form.type === 'ONE_TIME' && (
          <div className="modal-form__group">
            <span className="modal-form__label">Justificatif</span>
            {receiptToShow ? (
              <ReceiptHint
                receipt={receiptToShow}
                onRemove={() => setRemoveReceipt(true)}
                onOpen={() => window.open(`${(import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '')}${receiptToShow.url}`, '_blank', 'noopener')}
              />
            ) : (
              <div className="upload">
                <input
                  ref={fileInputRef}
                  id="expense-receipt"
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.pdf"
                  className="sr-only"
                  onChange={handleFile}
                />
                <label htmlFor="expense-receipt" className="upload__target">
                  <LuUpload aria-hidden="true" />
                  <span>
                    {file ? file.name : 'Choisir un fichier'}
                    <em>JPEG, PNG, GIF ou PDF · 1 Mo maximum</em>
                  </span>
                </label>
              </div>
            )}
            {removeReceipt && expense?.receiptUpload && (
              <p className="hint">Le justificatif sera supprimé à l’enregistrement.</p>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
