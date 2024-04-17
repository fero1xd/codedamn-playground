import { useEffect } from 'react';

/**
 * Defaults browser to dark mode by adding class="dark" to html element
 * Have to do this as it doesnt work if u simply add class="dark" in index.html
 */
export function useDarkMode() {
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    console.log(isDarkMode);

    if (isDarkMode) return;

    document.documentElement.classList.add('dark');
  }, []);
}
