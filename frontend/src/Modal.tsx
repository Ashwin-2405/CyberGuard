import React from "react";

// Usage: <Modal open={modalOpen} onClose={() => setModalOpen(false)}> ... </Modal>

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose} tabIndex={-1}>
      <div
        className="modal-content fade-in-up"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {title && <h3 id="modal-title" className="text-xl font-bold mb-2">{title}</h3>}
        {children}
        <button className="btn btn-danger mt-8 float-right" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
