const credentialName = "credentials";
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
  if (!src.startsWith('https://')){
    src = chrome.runtime.getURL(src);
  }
  styleElement.href = src;
  (document.head || document.documentElement).prepend(styleElement);
};

function injectCredetials(credentials: string) {
  const element = document.createElement('div');
  element.id = 'injected-data-element';
  element.style.display = 'none';
  element.dataset[credentialName] = credentials;
  (document.head || document.documentElement).appendChild(element);
}

chrome.storage.local.get('credentials').then(cred => {
    if (!cred[credentialName]){
      alert(`You're not logged in!`)
    }
    injectScript('injected-script.js');
    injectStyle('character-sheet-real-dark-mode.css');
    injectStyle('https://fonts.googleapis.com/icon?family=Material+Icons');
    injectCredetials(cred[credentialName]);
  }
)

