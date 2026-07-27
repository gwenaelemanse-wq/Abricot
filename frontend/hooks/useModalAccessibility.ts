"use client";

import { useEffect, useRef } from "react";

export function useModalAccessibility(
  isOpen: boolean,
  onClose: () => void
) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  // On garde toujours la dernière version de onClose sans que ça
  // déclenche l'effet ci-dessous.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Focus initial + mémorisation de l'élément d'origine :
  // ne se déclenche QUE quand la modale s'ouvre/se ferme,
  // jamais à cause d'un re-render pendant la saisie.
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

    getFocusableElements()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
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
  }, [isOpen]); // ✅ onClose retiré des dépendances

  return modalRef;
}