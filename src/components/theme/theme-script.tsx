/**
 * Runs during HTML parsing, before first paint, so the page never flashes the wrong theme.
 * The visitor's saved choice wins; everyone else gets dark, whatever their system setting.
 */
export const THEME_STORAGE_KEY = "theme";

const script = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t="dark"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
