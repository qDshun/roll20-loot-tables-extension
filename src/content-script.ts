function injectScript (src: string) {
  const scriptElement = document.createElement('script');
  scriptElement.src = chrome.runtime.getURL(src);
  scriptElement.onload = () =>{
    scriptElement.remove();
  }
  (document.head || document.documentElement).append(scriptElement);
};

function injectStyle (src: string) {
  const styleElement = document.createElement('link');
  styleElement.rel = 'stylesheet';
  styleElement.type = 'text/css';
  styleElement.href = chrome.runtime.getURL(src);
  (document.head || document.documentElement).prepend(styleElement);
};

injectScript('injected-script.js');
injectStyle('character-sheet-real-dark-mode.css');
