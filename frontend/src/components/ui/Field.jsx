import { forwardRef, useId } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import './Field.css';

/**
 * Form field primitives.
 *
 * Every input shares one shell: optional label, leading icon, trailing slot
 * (e.g. the currency code on amount fields), hint or error underneath. The
 * label is wired with htmlFor/id, the error with aria-describedby, so screen
 * readers get the same information sighted users do.
 */

function useFieldIds(id, error, hint) {
  const generated = useId();
  const fieldId = id || `field-${generated}`;
  const describedBy = [error ? `${fieldId}-error` : null, hint ? `${fieldId}-hint` : null]
    .filter(Boolean)
    .join(' ');
  return { fieldId, describedBy: describedBy || undefined };
}

function FieldShell({ label, error, hint, fieldId, describedBy, children, className = '', ...rest }) {
  return (
    <div className={['field', className].filter(Boolean).join(' ')} {...rest}>
      {label && (
        <label className="field__label" htmlFor={fieldId}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="field__message field__message--error" id={`${fieldId}-error`}>
          {error}
        </p>
      ) : hint ? (
        <p className="field__message" id={`${fieldId}-hint`}>
          {hint}
        </p>
      ) : null}
      {error && describedBy ? null : null}
    </div>
  );
}

export const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon: Icon,
    suffix,
    id,
    className = '',
    inputClassName = '',
    ...rest
  },
  ref
) {
  const { fieldId, describedBy } = useFieldIds(id, error, hint);

  return (
    <FieldShell
      label={label}
      error={error}
      hint={hint}
      fieldId={fieldId}
      describedBy={describedBy}
      className={className}
    >
      <div
        className={[
          'field__control',
          Icon ? 'field__control--with-icon' : '',
          suffix ? 'field__control--with-suffix' : '',
          error ? 'field__control--error' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {Icon && <Icon className="field__icon" aria-hidden="true" />}
        <input
          ref={ref}
          id={fieldId}
          className={['field__input', inputClassName].filter(Boolean).join(' ')}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {suffix && <span className="field__suffix">{suffix}</span>}
      </div>
    </FieldShell>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, id, className = '', rows = 3, ...rest },
  ref
) {
  const { fieldId, describedBy } = useFieldIds(id, error, hint);

  return (
    <FieldShell label={label} error={error} hint={hint} fieldId={fieldId} describedBy={describedBy} className={className}>
      <div className={['field__control', error ? 'field__control--error' : ''].filter(Boolean).join(' ')}>
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          className="field__input field__input--area"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
      </div>
    </FieldShell>
  );
});

export const Select = forwardRef(function Select(
  { label, error, hint, id, className = '', children, ...rest },
  ref
) {
  const { fieldId, describedBy } = useFieldIds(id, error, hint);

  return (
    <FieldShell label={label} error={error} hint={hint} fieldId={fieldId} describedBy={describedBy} className={className}>
      <div
        className={['field__control', 'field__control--select', error ? 'field__control--error' : '']
          .filter(Boolean)
          .join(' ')}
      >
        <select
          ref={ref}
          id={fieldId}
          className="field__input field__input--select"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          {...rest}
        >
          {children}
        </select>
        <LuChevronDown className="field__chevron" aria-hidden="true" />
      </div>
    </FieldShell>
  );
});

/** Groups fields side by side on wide screens, stacked on phones. */
export function FieldRow({ children, columns = 2, className = '' }) {
  return (
    <div
      className={['field-row', className].filter(Boolean).join(' ')}
      style={{ '--field-columns': columns }}
    >
      {children}
    </div>
  );
}
