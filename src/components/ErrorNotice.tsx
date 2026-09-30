import React from 'react';
import { AlertTriangle, RefreshCw, X, MessageSquare, ShieldAlert } from 'lucide-react';
import { ErrorInfo } from '../types';

interface ErrorNoticeProps {
  error: ErrorInfo;
  onRetry: () => void;
  onDismiss: () => void;
  onSwitchToText: () => void;
}

export const ErrorNotice: React.FC<ErrorNoticeProps> = ({
  error,
  onRetry,
  onDismiss,
  onSwitchToText,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto my-3 p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-500/20 text-rose-300 rounded-xl mt-0.5 shrink-0">
            {error.code === 'MIC_PERMISSION_DENIED' ? (
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-rose-200">
              {error.title}
            </h4>
            <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">
              {error.message}
            </p>
            {error.recoverySuggestion && (
              <p className="text-xs text-rose-200/80 mt-1.5 font-medium bg-rose-900/30 p-2 rounded-lg border border-rose-800/40">
                👉 <span className="font-semibold">Action:</span> {error.recoverySuggestion}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="text-rose-400 hover:text-rose-200 p-1 rounded-lg hover:bg-rose-900/40 transition-colors"
          aria-label="Dismiss error notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3.5 pt-3 border-t border-rose-800/30 flex items-center justify-end gap-2 text-xs">
        <button
          type="button"
          onClick={onSwitchToText}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Use Text Fallback</span>
        </button>

        {error.canRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
};
