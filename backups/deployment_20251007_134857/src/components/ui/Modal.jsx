import React, { useEffect } from 'react'

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true
}) {
  // ...existing code for escape key, body scroll, and UI...
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Modal UI would be implemented here */}
    </div>
  )
}

// Specialized Modal Components
export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger' // 'danger', 'warning', 'info'
}) {
  // ...existing code for ConfirmModal UI...
  return null
}

export function FormModal({ 
  isOpen, 
  onClose, 
  title, 
  onSubmit, 
  children,
  submitText = 'Save',
  cancelText = 'Cancel',
  isLoading = false,
  size = 'md'
}) {
  // ...existing code for FormModal UI...
  return null
}
