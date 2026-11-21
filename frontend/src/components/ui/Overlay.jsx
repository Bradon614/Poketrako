import { createContext, useCallback, useContext, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LuCircleAlert, LuX } from 'react-icons/lu';
import { useEscapeKey, useFocusTrap, useScrollLock } from '../../lib/hooks';
import { Button, IconButton } from './Button';
import './Overlay.css';

/**
 * Overlay layer: Modal (centred dialog that becomes a bottom sheet on
 * phones), Sheet, and a promise-based confirmation dialog that replaces
 * `window.confirm`.
 *
 * Accessibility: role="dialog" + aria-modal, labelled by its title, focus
 * moved in on open and restored on close, Tab trapped inside, Escape closes,
 * background scroll locked.
 */

const VARIANTS = ['auto', 'center', 'sheet'];

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  variant = 'auto',
  closeOnBackdrop = true,
  className = '',
}) {
  const panelRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useScrollLock(open);
  useEscapeKey(onClose, open);
  useFocusTrap(panelRef, open);

  if (!open) return null;

  return createPortal(
    <div className="modal-portal">
      <div
        className="modal__backdrop"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={[
          'modal__panel',
          `modal__panel--${size}`,
          `modal__panel--${VARIANTS.includes(variant) ? variant : 'auto'}`,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <header className="modal__head">
          <div className="modal__titles">
            {title && (
              <h2 className="modal__title" id={titleId}>
                {title}
              </h2>
            )}
            {description && (
              <p className="modal__description" id={descriptionId}>
                {description}
              </p>
            )}
          </div>
          <IconButton icon={LuX} label="Fermer" onClick={onClose} size="sm" variant="quiet" />
        </header>

        {children && <div className="modal__body">{children}</div>}
        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}

/* -------------------------------------------------------------------------- */
/* Promise-based confirmation                                                  */
/* -------------------------------------------------------------------------- */

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);
  const [busy, setBusy] = useState(false);

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        setRequest({ ...options, resolve });
      }),
    []
  );

  const settle = useCallback(
    (result) => {
      request?.resolve(result);
      setRequest(null);
      setBusy(false);
    },
    [request]
  );

  const value = { confirm };

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Modal
        open={Boolean(request)}
        onClose={() => settle(false)}
        title={request?.title}
        description={request?.message}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => settle(false)}>
              {request?.cancelLabel || 'Annuler'}
            </Button>
            <Button
              variant={request?.destructive ? 'danger' : 'primary'}
              loading={busy}
              onClick={async () => {
                if (request?.onConfirm) {
                  setBusy(true);
                  try {
                    await request.onConfirm();
                  } finally {
                    setBusy(false);
                  }
                }
                settle(true);
              }}
            >
              {request?.confirmLabel || 'Confirmer'}
            </Button>
          </>
        }
      >
        {request?.destructive && (
          <p className="confirm__warning">
            <LuCircleAlert aria-hidden="true" />
            Cette action est définitive.
          </p>
        )}
      </Modal>
    </ConfirmContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- provider + its hook live together
export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within a ConfirmProvider');
  return context.confirm;
}
