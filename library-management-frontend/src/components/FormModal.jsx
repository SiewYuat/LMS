import React from 'react';
import './FormModal.css';

const FormModal = ({ 
  show, 
  onHide, 
  onClose, // Keep backward compatibility
  title, 
  size = 'medium', 
  children 
}) => {
  // Handle backward compatibility
  const isVisible = show !== undefined ? show : true; // If show prop exists, use it; otherwise default to true (old behavior)
  const handleClose = onHide || onClose; // Use onHide if available, otherwise fallback to onClose

  // Don't render if show is explicitly false
  if (show === false) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <div 
      className="form-modal-backdrop" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className={`form-modal-container form-modal-${size}`}>
        <div className="form-modal-content">
          <div className="form-modal-header">
            <h4 className="form-modal-title">{title}</h4>
            <button 
              className="form-modal-close"
              onClick={handleClose}
              type="button"
              aria-label="Close"
            >
              <span>&times;</span>
            </button>
          </div>
          
          <div className="form-modal-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormModal;