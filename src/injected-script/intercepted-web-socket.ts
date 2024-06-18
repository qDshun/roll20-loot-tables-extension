import { Injector, inject } from "@angular/core";
import { getInjectorRef, injectFromGlobalContext, injectLootTableDropdown } from "./component-injection/component-injector";
import { ResponseParserService } from "./firebase-server/response-parser.service";
import 'zone.js';
import { LootService } from "./component-injection/services/loot.service";
import { Observable, ReplaySubject, take } from "rxjs";
import { StateService } from "./firebase-server/state.service";
import { ItemService } from "./item-creation/item.service";
import { getItemRequests$ } from "../injected-script";
import { InventoryItem } from "./item-creation/item.model";
import { CharacterDetailsResponse, DataServerResponse, HandoutDetailsResponse, RequestResponse } from "./firebase-server/types";


export class InterceptedWebSocket extends window.WebSocket {
  private pendingRequests = new Map();
  private customRequestId = 100000;
  private jsonPartitial = '';
  private responseParser!: ResponseParserService;
  websocketType: undefined | 'Firebase' | 'WebRTC' = undefined;
  lastSendFirebaseMessageId = 0;

  constructor(url: any, protocols: any) {
    super(url, protocols);
    this.websocketType = this.saveWebsocketType(url, this);
    if (this.websocketType != 'Firebase')
      return;
    console.log('Starting initing angular context')
    ;
    const stateService = new StateService();
    this.responseParser = new ResponseParserService(this, stateService);
    const itemService = new ItemService(this, stateService);

    (window as any).getCharacterData = (characterId: string) => itemService.requestCharacterData(characterId);
    (window as any).getHandoutData = (handoutId: string) => itemService.requestHandoutData(handoutId);
    this.initAngularAndNotifyInjectedScript(stateService);
    this.startProcessingItemRequests(itemService);
    this.addEventListener('message', (event) => {
      if (this.websocketType != 'Firebase')
        return;
      this.onMessageReceived(event);
    });
  }

  override send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (this.websocketType != 'Firebase')
      return;
    super.send(data);
  }

  getRequestId(){
    return this.customRequestId++;
  }

  sendAsync(data: string, requestId: number): Promise<any>{
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(requestId, { resolve, reject });

      if (this.websocketType != 'Firebase'){
        throw new Error("Only firebase socket is supported for now");
      }
      this.send(data)

      setTimeout(() => {
          if (this.pendingRequests.has(requestId)) {
              reject(new Error('Request timed out'));
              this.pendingRequests.delete(requestId);
          }
      }, 5000);
  });
  }

  private saveWebsocketType(url: string, websocket: InterceptedWebSocket): undefined | 'Firebase' | 'WebRTC' {
    if (url.indexOf('firebase') != -1){
      (window as any).FirebaseWebSocket = websocket;
      return 'Firebase';
    }
    if (url.indexOf('webrtc') != -1){
      (window as any).WebRTCWebSocket = websocket;
      return 'WebRTC';
    }
    return undefined;
  }

  private tryParseMessage(event: MessageEvent<any>): object | null {
    try {
      return JSON.parse(event.data);
    }
    catch {
      this.jsonPartitial += event.data;
      try {
        var longJson = JSON.parse(this.jsonPartitial);
        this.jsonPartitial = '';
        return longJson;
      }
      catch { }
    }
    return null;
  }

  private onMessageReceived(event: MessageEvent<any>){
    const parsed: object | null = this.tryParseMessage(event);
    if (parsed) {
      const serverReponse = this.responseParser.processFirebaseResponse(parsed);
      if ((serverReponse as DataServerResponse)?.subtype == 'request-response'){
        const requestResponse = (serverReponse as RequestResponse)
        const pendingRequest = this.pendingRequests.get(requestResponse?.requestId);
        pendingRequest?.resolve(serverReponse);
      }
    }
  }

  private initAngularAndNotifyInjectedScript(stateService: StateService) {
    injectLootTableDropdown('body').then(() => {
      stateService.initFinished$.pipe(
        take(1)
      )
      .subscribe(() => ((window as any).initReady as ReplaySubject<void>).next())
    });
  }

  private startProcessingItemRequests(itemService: ItemService) {
    getItemRequests$().subscribe(request => {
      itemService.saveItem(request)
    })

  }
}

export function getCharacterData(characterId: string): Observable<CharacterDetailsResponse>{
  return (window as any).getCharacterData(characterId);
}

export function getHandoutData(handoutId: string): Observable<HandoutDetailsResponse>{
  return (window as any).getHandoutData(handoutId);
}
