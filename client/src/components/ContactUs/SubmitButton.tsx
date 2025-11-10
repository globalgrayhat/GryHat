import React from "react";

type Props = {
  isSubmitting: boolean;
  labels: { submit: string; sending: string };
};

const SubmitButton: React.FC<Props> = ({ isSubmitting, labels }) => {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="
        inline-flex items-center justify-center gap-2 rounded-xl
        bg-gradient-to-r from-blue-600 to-indigo-500 px-6 py-2.5
        text-sm font-semibold text-white shadow-md transition-all
        hover:from-blue-700 hover:to-indigo-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-60
        dark:focus:ring-offset-gray-900
      "
    >
      {isSubmitting ? (
        <>
          <svg
            className="w-4 h-4 text-white animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          {labels.sending}
        </>
      ) : (
        labels.submit
      )}
    </button>
  );
};

export default SubmitButton;
