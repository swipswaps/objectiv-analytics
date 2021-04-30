export function documentLoaded(document = window.document) {
  return new Promise<void>((resolve) => {
    if (document.readyState !== 'loading') {
      resolve();
    } else {
      document.addEventListener('DOMContentLoaded', () => resolve());
    }
  });
}
