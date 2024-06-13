import { Injector, inject } from "@angular/core";
import { getInjectorRef, injectFromGlobalContext, injectLootTableDropdown } from "./component-injection/component-injector";
import { ResponseParserService } from "./firebase-server/response-parser.service";
import 'zone.js';
import { LootService } from "./component-injection/services/loot.service";
import { ReplaySubject, take } from "rxjs";
import { StateService } from "./firebase-server/state.service";


export class InterceptedWebSocket extends window.WebSocket {
  private pendingRequests = new Map();
  private customRequestId = 100000;
  private jsonPartitial = '';
  private responseParser!: ResponseParserService;
  private stateService: StateService = new StateService();
  websocketType: undefined | 'Firebase' | 'WebRTC' = undefined;
  lastSendFirebaseMessageId = 0;

  constructor(url: any, protocols: any) {
    super(url, protocols);
    this.websocketType = this.saveWebsocketType(url, this);
    if (this.websocketType != 'Firebase')
      return;
    console.log('Starting initing angular context');

    this.responseParser = new ResponseParserService(this, this.stateService);
    this.initAngularAndNotifyInjectedScript();

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
      this.responseParser.processFirebaseResponse(parsed);
    }
  }

  private initAngularAndNotifyInjectedScript() {
    injectLootTableDropdown('body').then(() => {
      console.log('injecting done!')
      this.stateService.initFinished$.pipe(
        take(1)
      )
      .subscribe(() => ((window as any).initReady as ReplaySubject<void>).next())
    });
  }
}

