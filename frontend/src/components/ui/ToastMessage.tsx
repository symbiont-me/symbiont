import React from 'react';

type ToastMessageProps = {
  message: string;
  type: 'info' | 'success' | 'error';
};

const ToastMessage: React.FC<ToastMessageProps> = ({ message, type }) => {
  const toastTypeClass = {
    info: 'alert-info',
    success: 'alert-success',
    error: 'alert-error',
  };

  return (
    <div className={`toast toast-top toast-end`}>
      <div className={`alert ${toastTypeClass[type]}`}>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default ToastMessage;