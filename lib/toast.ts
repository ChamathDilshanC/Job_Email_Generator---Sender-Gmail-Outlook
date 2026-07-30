import { gooeyToast } from 'goey-toast';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Single entry point for toast notifications across the app, so every page
 * gets the same goey-toast styling/behavior instead of re-importing
 * `gooeyToast` and re-deciding options per call site.
 */
export function showToast(
  type: ToastType,
  title: string,
  description?: string
) {
  const options = description ? { description } : undefined;

  switch (type) {
    case 'success':
      gooeyToast.success(title, options);
      break;
    case 'error':
      gooeyToast.error(title, options);
      break;
    case 'warning':
      gooeyToast.warning(title, options);
      break;
    case 'info':
    default:
      gooeyToast.info(title, options);
      break;
  }
}
