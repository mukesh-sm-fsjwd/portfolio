// ===================================
// Reusable Confirm Modal (replaces window.confirm)
// ===================================

export default function ConfirmModal({ title, message, type = 'danger', onConfirm, onCancel }) {
  const iconMap = {
    danger: 'fas fa-exclamation-triangle',
    warning: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle',
  };

  return (
    <div
      className="confirm-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="confirm-modal">
        <div className="confirm-modal-header">
          <div className={`confirm-modal-icon ${type}`}>
            <i className={iconMap[type] || iconMap.info} aria-hidden="true"></i>
          </div>
          <h3 className="confirm-modal-title" id="confirm-title">{title}</h3>
        </div>
        <div className="confirm-modal-message">{message}</div>
        <div className="confirm-modal-actions">
          <button className="confirm-btn confirm-btn-cancel" id="confirm-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-btn confirm-btn-confirm" id="confirm-ok-btn" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
