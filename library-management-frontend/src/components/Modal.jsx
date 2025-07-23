import './Modal.css'

const Modal = ({ isOpen, onClose, title, message, type = 'error' }) => {
  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌'
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '❌'
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className={`modal-content modal-${type}`}>
          <div className="modal-header">
            <div className="modal-icon">
              {getIcon()}
            </div>
            <h3 className="modal-title">{title}</h3>
          </div>
          
          <div className="modal-body">
            <p className="modal-message">{message}</p>
          </div>
          
          <div className="modal-footer">
            <button 
              className={`modal-button modal-button-${type}`}
              onClick={onClose}
              autoFocus
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal
