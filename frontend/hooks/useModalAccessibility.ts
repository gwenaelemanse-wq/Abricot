"use client";

import { useEffect, useRef } from "react";

// Gère les deux comportements clavier attendus d'une modale accessible :
// - Echap ferme la modale.
// - Tab reste "piégé" à l'intérieur de la modale (ne sort jamais sur
//   la page derrière), et revient au premier champ après le dernier.
// À la fermeture, le focus revient à l'élément qui avait ouvert
// la modale (ex: le bouton "+ Créer un projet").
export function useModalAccessibility(
  isOpen: boolean,
  onClose: () => void
) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previouslyFocusedElement.current =
      document.activeElement as HTMLElement;

    const modalNode = modalRef.current;

    const getFocusableElements = (): HTMLElement[] => {
      if (!modalNode) {
        return [];
      }
      return Array.from(
        modalNode.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      );
    };

    // Donne le focus au premier élément de la modale à l'ouverture.
    getFocusableElements()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const elements = getFocusableElements();
      if (elements.length === 0) {
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement.current?.focus();
    };
  }, [isOpen, onClose]);

  return modalRef;
}