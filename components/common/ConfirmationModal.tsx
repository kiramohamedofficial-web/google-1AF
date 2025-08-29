import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  icon?: React.ReactNode;
}

const DefaultIcon: React.FC = () => (
    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
        <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
    </div>
);

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700',
  icon = <DefaultIcon />
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[101] flex items-center justify-center p-4" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="relative transform overflow-hidden rounded-2xl bg-[hsl(var(--color-surface))] text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg animate-fade-in-up" 
        style={{ animationDuration: '0.3s' }}
        onClick={e => e.stopPropagation()}
      >
          <div className="bg-[hsl(var(--color-surface))] px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                  {icon}
                  <div className="mt-3 text-center sm:mt-0 sm:mr-4 sm:text-right">
                      <h3 className="text-xl font-bold leading-6 text-[hsl(var(--color-text-primary))]" id="modal-title">{title}</h3>
                      <div className="mt-2">
                          <p className="text-base text-[hsl(var(--color-text-secondary))]">{message}</p>
                      </div>
                  </div>
              </div>
          </div>
        <div className="bg-[hsl(var(--color-background))] px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 rounded-b-2xl">
            <button 
              type="button"
              onClick={onConfirm} 
              className={`inline-flex w-full justify-center rounded-md px-4 py-2 text-base font-semibold text-white shadow-sm transition-colors sm:ml-3 sm:w-auto ${confirmButtonClass}`}
            >
              {confirmText}
            </button>
            <button 
              type="button"
              onClick={onClose} 
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-600 px-4 py-2 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              {cancelText}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
