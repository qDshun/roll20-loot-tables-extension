import { ReplaySubject, Subject } from "rxjs";
import { InterceptedWebSocket } from "./injected-script/intercepted-web-socket";
import 'zone.js';
import { getInjectorRef } from "./injected-script/component-injection/component-injector";
import { LootService } from "./injected-script/component-injection/services/loot.service";

console.log("Hi! I`m injected-script.ts");

(function() {
  (window as any).initReady = new ReplaySubject<void>();
  const OriginalWebSocket = window.WebSocket;
  window.WebSocket = InterceptedWebSocket;
  ((window as any).initReady as ReplaySubject<unknown>).subscribe(() => onAngularAndWebSocketInitFinished());
})();

export function onAngularAndWebSocketInitFinished(){
  console.log('We are now out of the constructor!');
  const angularInjector = getInjectorRef();

  const lootService = angularInjector.get(LootService);
  lootService.test();
  console.log('Init finished');
  const elements = Array.from(document.querySelectorAll('.journalitem.dd-item.character.ui-draggable div.name'));
  console.log(elements);
  elements
    .map(
      item => item.addEventListener('auxclick', (e) => {
        console.log('scroll clicked, hiding loot table', e);
        lootService.hideLootSelection();
      })
    )

}
