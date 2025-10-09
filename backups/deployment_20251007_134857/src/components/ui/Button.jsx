import React from 'react'
import { Spinner } from './Loading'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  onClick,
  ...props
}) {
  // ...existing code for baseClasses, variants, sizes, isDisabled, buttonClasses, renderIcon, renderContent, and UI...
  return (
    <button
      className={buttonClasses}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {renderContent()}
    </button>
  )
}

// ...existing code for IconButton, ButtonGroup, SplitButton, FloatingActionButton, ToggleButton...
