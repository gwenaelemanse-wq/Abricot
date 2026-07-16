"use client";

type ForgotPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ForgotPasswordModal({
  isOpen,
  onClose,
}: ForgotPasswordModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-password-title"
        className="relative w-full max-w-sm rounded-lg bg-white px-8 py-8 shadow-lg"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la fenêtre"
          className="absolute right-4 top-4 text-xl text-gray-400 transition hover:text-gray-600"
        >
          ×
        </button>

        <h2
          id="forgot-password-title"
          className="text-lg font-semibold text-neutral-900"
        >
          Mot de passe oublié
        </h2>

        <p className="mt-4 text-sm text-gray-600">
          La réinitialisation automatique par email n&apos;est pas
          encore disponible sur cette version d&apos;Abricot.
        </p>

        <p className="mt-3 text-sm text-gray-600">
          Merci de contacter un administrateur pour réinitialiser
          votre mot de passe.
          admin2@abrico.com
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-md bg-neutral-900 px-6 py-3 text-sm text-white transition hover:bg-neutral-800"
        >
          Compris
        </button>
      </div>
    </div>
  );
}