function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export const bulmaTextColor = getCssVar('--bulma-text') || '#363636'; // fallback if undefined
