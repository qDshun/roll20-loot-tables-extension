import { ReplaySubject, Subject } from "rxjs";
import { InterceptedWebSocket } from "./injected-script/intercepted-web-socket";
import 'zone.js';
import { getInjectorRef, injectFromGlobalContext } from "./injected-script/component-injection/component-injector";
import { LootService } from "./injected-script/component-injection/services/loot.service";
import { ApiService } from "./injected-script/component-injection/services/api.service";
import { CreateItemRequest, InventoryItem, UpdateHandoutRequest, UpdateSingleFieldRequest } from "./injected-script/item-creation/item.model";
import { IdentityService } from "./injected-script/component-injection/services/identity.service";
import { LoginRequest } from "./injected-script/component-injection/models";

console.log("Hi! I`m injected-script.ts");

(function() {
  (window as any).initReady = new ReplaySubject<void>();
  (window as any).createItemRequest$ = new ReplaySubject<CreateItemRequest | UpdateSingleFieldRequest>();
  const OriginalWebSocket = window.WebSocket;
  window.WebSocket = InterceptedWebSocket;
  ((window as any).initReady as ReplaySubject<unknown>).subscribe(() => onAngularAndWebSocketInitFinished());
})();

export function onAngularAndWebSocketInitFinished(){
  const angularInjector = getInjectorRef();
  const apiService = injectFromGlobalContext(ApiService);
  const lootService = injectFromGlobalContext(LootService);
  const identityService = injectFromGlobalContext(IdentityService);
  login(identityService);

  lootService.hideLootSelection();
  const characterItems = Array.from(document.querySelectorAll('.journalitem.dd-item.character.ui-draggable'));
  const handoutItems =  Array.from(document.querySelectorAll('.journalitem.dd-item.handout.ui-draggable'));
  characterItems.map((item) => item.addEventListener('auxclick', (e) => onCharacterItemClicked(item as HTMLElement, e, lootService)));
  handoutItems.map((item) => item.addEventListener('auxclick', (e) => onCharacterItemClicked(item as HTMLElement, e, lootService)));

}

function login(identityService: IdentityService){
  const credentialsElement = document.getElementById('injected-data-element');
  console.log(credentialsElement)
  const credentials = credentialsElement?.dataset["credential"];
  if (credentials){
    const loginRequest = { email: credentials.split(';')[0], password: credentials.split(';')[1]} as LoginRequest;
    identityService.login(loginRequest, true).subscribe(() =>
      console.log('login successfull!!!')
    )
  }
}

export function onCharacterItemClicked(characterItem: HTMLElement, e: Event, lootService: LootService){
  lootService.selectedCharacterId$.next((characterItem?.dataset["itemid"] as any)?.toString());
  lootService.showLootSelection();
}

export function createItem(request: CreateItemRequest | UpdateSingleFieldRequest | UpdateHandoutRequest) {
  ((window as any).createItemRequest$ as ReplaySubject<CreateItemRequest | UpdateSingleFieldRequest | UpdateHandoutRequest>).next(request);
}

export function getItemRequests$() {
  return ((window as any).createItemRequest$ as ReplaySubject<CreateItemRequest | UpdateSingleFieldRequest | UpdateHandoutRequest>);
}
