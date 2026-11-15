const TAB_PATH = ".site-tabs > .tabs > .tab";
const TABS_OF_ROOT = ":scope > .tabs > .tab";
const PANELS_OF_ROOT = ":scope > .tab-contents > .content";
const ACTIVE_CLASS = "active";
const READY_ATTRIBUTE = "data-tabs-ready";

let siteTabsInstanceCount = 0;

function getTabs(root: Element) {
  return Array.from(root.querySelectorAll<HTMLElement>(TABS_OF_ROOT));
}

function getPanels(root: Element) {
  return Array.from(root.querySelectorAll<HTMLElement>(PANELS_OF_ROOT));
}

function activateTab(root: Element, index: number, focus = false) {
  const tabs = getTabs(root);

  tabs.forEach((tab, tabIndex) => {
    const isActive = tabIndex === index;
    tab.classList.toggle(ACTIVE_CLASS, isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  getPanels(root).forEach((panel, panelIndex) => {
    panel.classList.toggle(ACTIVE_CLASS, panelIndex === index);
  });

  if (focus) {
    tabs[index]?.focus();
  }
}

function setupTabs(root: HTMLElement) {
  const tabs = getTabs(root);
  if (tabs.length === 0) {
    return;
  }

  if (!root.dataset.tabsId) {
    siteTabsInstanceCount += 1;
    root.dataset.tabsId = String(siteTabsInstanceCount);
  }

  const baseId = `site-tabs-${root.dataset.tabsId}`;
  const panels = getPanels(root);

  tabs.forEach((tab, index) => {
    const panel = panels[index];
    tab.id ||= `${baseId}-tab-${index + 1}`;

    if (panel) {
      panel.id ||= `${baseId}-panel-${index + 1}`;
      tab.setAttribute("aria-controls", panel.id);
      panel.setAttribute("aria-labelledby", tab.id);
    }
  });

  const activeIndex = tabs.findIndex((tab) => tab.classList.contains(ACTIVE_CLASS));
  activateTab(root, Math.max(activeIndex, 0));
  root.setAttribute(READY_ATTRIBUTE, "");
}

function resolveTab(container: HTMLElement, target: EventTarget | null) {
  const tab = (target as Element | null)?.closest<HTMLElement>(TAB_PATH);
  const root = tab?.parentElement?.parentElement;

  if (!tab || !root || !container.contains(tab)) {
    return null;
  }

  // The content HTML can be re-rendered after load, dropping the ids/ARIA set
  // up front; restore them lazily so switching always works.
  if (!root.hasAttribute(READY_ATTRIBUTE)) {
    setupTabs(root);
  }

  return { tab, root };
}

/**
 * Wires up every `.site-tabs` block inside `container` (the "Tabbed Contents"
 * editor snippet): shows one `.content` panel at a time and switches on click
 * or arrow keys. Listeners are delegated so they survive `innerHTML` rewrites.
 */
export function initSiteTabs(container: HTMLElement): () => void {
  container.querySelectorAll<HTMLElement>(".site-tabs").forEach(setupTabs);

  const onClick = (event: MouseEvent) => {
    const resolved = resolveTab(container, event.target);
    if (!resolved) {
      return;
    }

    activateTab(resolved.root, getTabs(resolved.root).indexOf(resolved.tab));
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const resolved = resolveTab(container, event.target);
    if (!resolved) {
      return;
    }

    const tabs = getTabs(resolved.root);
    const current = tabs.indexOf(resolved.tab);
    let next: number;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = (current + 1) % tabs.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = (current - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = tabs.length - 1;
        break;
      case "Enter":
      case " ":
        next = current;
        break;
      default:
        return;
    }

    event.preventDefault();
    activateTab(resolved.root, next, true);
  };

  container.addEventListener("click", onClick);
  container.addEventListener("keydown", onKeyDown);

  return () => {
    container.removeEventListener("click", onClick);
    container.removeEventListener("keydown", onKeyDown);
  };
}
