export const OPEN_ASSISTANT_EVENT = 'tavares:open';

export function openExistingAssistant() {
  window.dispatchEvent(new Event(OPEN_ASSISTANT_EVENT));
}
