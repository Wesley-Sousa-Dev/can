"use client";

import { useRef, type KeyboardEvent } from "react";

// Teclado das abas no padrão do W3C (APG): setas, Home e End trocam de aba e
// levam o foco junto. Só a aba ativa fica na ordem do Tab (tabIndex 0).
export function useTabListNavigation<TTabId extends string>(
  tabIds: readonly TTabId[],
  selectedTabId: TTabId,
  onSelectTab: (tabId: TTabId) => void,
) {
  const tabElementsById = useRef(new Map<TTabId, HTMLElement>());

  function registerTab(tabId: TTabId) {
    return (element: HTMLElement | null) => {
      if (element) {
        tabElementsById.current.set(tabId, element);
      } else {
        tabElementsById.current.delete(tabId);
      }
    };
  }

  function handleTabListKeyDown(event: KeyboardEvent<HTMLElement>) {
    const currentIndex = tabIds.indexOf(selectedTabId);
    const lastIndex = tabIds.length - 1;
    const targetIndexByKey: Record<string, number> = {
      ArrowRight: currentIndex === lastIndex ? 0 : currentIndex + 1,
      ArrowLeft: currentIndex === 0 ? lastIndex : currentIndex - 1,
      Home: 0,
      End: lastIndex,
    };

    const targetIndex = targetIndexByKey[event.key];
    if (targetIndex === undefined) {
      return;
    }

    event.preventDefault();
    const targetTabId = tabIds[targetIndex];
    onSelectTab(targetTabId);
    tabElementsById.current.get(targetTabId)?.focus();
  }

  return { registerTab, handleTabListKeyDown };
}
