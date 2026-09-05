interface ConfirmDialogProps {
  open: boolean;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

const ConfirmDialog = ({ open, message, confirmLabel, cancelLabel, onConfirm, onCancel }: ConfirmDialogProps) => {
  if (!open) return null;
  return <dialog className="modal confirm-dialog" open aria-labelledby="confirm-message">
    <section className="modal-content">
      <h2 id="confirm-message">{message}</h2>
      <div className="confirm-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>{cancelLabel}</button>
        <button type="button" className="danger-button" onClick={() => void onConfirm()}>{confirmLabel}</button>
      </div>
    </section>
  </dialog>;
};

export default ConfirmDialog;
