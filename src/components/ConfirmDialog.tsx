import { useEffect, useId, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';

interface ConfirmDialogProps {
  open: boolean;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

const ConfirmDialog = ({ open, message, confirmLabel, cancelLabel, onConfirm, onCancel }: ConfirmDialogProps) => {
  const { state } = useApp();
  const { t } = useTranslation(state.language);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const messageId = useId();
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.showModal();
    cancelRef.current?.focus();
    return () => { dialog?.close(); previousFocus?.focus(); };
  }, [open]);
  const confirm = async () => {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    try { await onConfirm(); }
    finally { locked.current = false; setBusy(false); }
  };
  if (!open) return null;
  return <dialog ref={dialogRef} className="modal confirm-dialog" aria-labelledby={messageId} aria-busy={busy} onCancel={event => { event.preventDefault(); if (!locked.current) onCancel(); }}>
    <section className="modal-content">
      <h2 id={messageId}>{message}</h2>
      {state.error && <p className="form-error" role="alert">{t(state.error)}</p>}
      <div className="confirm-actions">
        <button ref={cancelRef} type="button" className="secondary-button" disabled={busy} onClick={onCancel}>{cancelLabel}</button>
        <button type="button" className="danger-button" disabled={busy} onClick={() => void confirm()}>{busy && <span className="loading-spinner" aria-hidden="true" />}{confirmLabel}</button>
      </div>
    </section>
  </dialog>;
};

export default ConfirmDialog;
