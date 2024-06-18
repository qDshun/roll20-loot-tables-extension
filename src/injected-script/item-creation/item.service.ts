import { Observable, from, of, race, switchMap, take, tap } from "rxjs";
import { CreateItemRequest, InventoryItem, UpdateHandoutRequest, UpdateSingleFieldRequest } from "./item.model";
import { InterceptedWebSocket } from "../intercepted-web-socket";
import { CharacterDetailsResponse, HandoutDetailsResponse, ServerResponse } from "../firebase-server/types";
import { StateService } from "../firebase-server/state.service";

export class ItemService {

  private readonly campaignId = '14599195-g5T9BBu1183YbNbSw16wSg';
  private readonly characterId = '-NuKtg7m56I2B4RGIFXQ';
  constructor (private firebaseWebSocket: InterceptedWebSocket, private stateService: StateService) {  }
  // async createItemFromName(itemName: string, itemLocation: string, itemNotes: string){
  //   this.saveItem(new InventoryItem(itemName, itemLocation, 1, 0, 0, itemNotes));
  // }

  saveItem(request: CreateItemRequest | UpdateSingleFieldRequest | UpdateHandoutRequest): Observable<void> {
    if (request instanceof CreateItemRequest) {
      return from(this.saveItemAsync(request.item, request.characterId)).pipe(
        tap(() => console.log('Item saved successfully', request.item))
      );
    }
    if (request instanceof UpdateSingleFieldRequest) {
      return from(this.updateItemFieldAsync(request.characterId, request.field.id, request.newValue)).pipe(
        tap(() => console.log('Item updated successfully', request.newValue))
      )
    }
    if (request instanceof UpdateHandoutRequest) {
      return from(this.updateHandoutAsync(request.handoutId, request.newValue)).pipe(
        tap(() => console.log('Handout updated successfully', request.newValue))
      )
    }
    return of().pipe(
      tap(() => console.error('Request type not supported', request))
    );
  }

  public requestCharacterData(characterId: string): Observable<CharacterDetailsResponse>{
    const requestId = this.firebaseWebSocket.getRequestId();
    const campaignId = getCampaignId();
    const request = `{"t":"d","d":{"r":${requestId},"a":"q","b":{"p":"/${campaignId}/char-attribs/char/${characterId}","h":""}}}`;
    this.firebaseWebSocket.sendAsync(request, requestId);
    return this.stateService.characterDetailsResponse$
      .pipe(
        take(1)
      );
    }

  public requestHandoutData(handoutId: string): Observable<HandoutDetailsResponse>{
    const requestId = this.firebaseWebSocket.getRequestId();
    const campaignId = getCampaignId();
    const request = `{"t":"d","d":{"r":${requestId},"a":"q","b":{"p":"/${campaignId}/hand-blobs/${handoutId}/notes","h":""}}}`;
    this.firebaseWebSocket.sendAsync(request, requestId);
    return this.stateService.handoutDetailsResponse$
      .pipe(
        take(1)
      );
    }

  private async saveItemAsync(item: InventoryItem, characterId: string){
    const rowId = this.generateFieldId();

    if (item.name)
      this.saveItemFieldAsync(characterId, rowId, 'name', item.name)
    if (item.location)
      this.saveItemFieldAsync(characterId, rowId, 'location', item.location);
    if (item.cost)
      this.saveItemFieldAsync(characterId, rowId, 'cost', item.cost);
    if (item.weight)
      this.saveItemFieldAsync(characterId, rowId, 'weight', item.weight);
    if (item.count)
      this.saveItemFieldAsync(characterId, rowId, 'count', item.count);
    if (item.notes)
      this.saveItemFieldAsync(characterId, rowId, 'notes', item.notes);
  }

  private async saveItemFieldAsync(characterId: string, rowId: string, fieldName: string, fieldValue: string | number){
    const requestId = this.firebaseWebSocket.getRequestId();
    const campaignId = getCampaignId();
    const fieldCreationMessage = this.getFieldCreationMessage(campaignId, characterId, this.generateFieldId(), rowId, fieldName, fieldValue.toString(), requestId);
    await this.firebaseWebSocket.sendAsync(fieldCreationMessage, requestId);
  }

  private async updateItemFieldAsync(characterId: string, fieldName: string, fieldValue: string | number){
    const requestId = this.firebaseWebSocket.getRequestId();
    const campaignId = getCampaignId();
    const fieldUpdateMessage = this.getFieldUpdateMessage(campaignId, characterId, fieldName, fieldValue.toString(), requestId);
    await this.firebaseWebSocket.sendAsync(fieldUpdateMessage, requestId);
  }

  private async updateHandoutAsync(handoutId: string, text: string){
    const requestId = this.firebaseWebSocket.getRequestId();
    const campaignId = getCampaignId();
    const fieldUpdateMessage = this.getHandoutUpdateMessage(campaignId, handoutId, escape(text), requestId);
    await this.firebaseWebSocket.sendAsync(fieldUpdateMessage, requestId);
  }

  private getFieldCreationMessage(campaignId: string, characterId: string, fieldId: string, rowId: string, attributeName: string, attributeValue: string, requestId: number){
    return `{"t":"d","d":{"r":${requestId},"a":"m","b":{"p":"/${campaignId}/char-attribs/char/${characterId}/${fieldId}",
    "d":{"name":"repeating_item_${rowId}_${attributeName}","current":"${attributeValue}","id":"${fieldId}"}}}}`;
  }

  private getFieldUpdateMessage(campaignId: string, characterId: string, fieldName: string, newValue: string, requestId: number){
    return `{"t":"d","d":{"r":${requestId},"a":"m","b":{"p":"/${campaignId}/char-attribs/char/${characterId}/${fieldName}","d":{"current":"${newValue}"}}}}`
  }

  private getHandoutUpdateMessage(campaignId: string, handoutId: string, encodedText: string, requestId: number){
    return `{"t":"d","d":{"r":${requestId},"a":"m","b":{"p":"/${campaignId}/hand-blobs/${handoutId}","d":{"notes":"${encodedText}"}}}}`
  }

  private generateFieldId(length = 20) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const hyphen = '-';
    let id = hyphen + 'N'; // Start with '-N'
    // So I have entirely different logic of generating IDs, but I don't care enough to fix it
    // Hyphens every 4 digits are not
    for (let i = 0; i < length - 3; i++) {
        if (i % 4 === 0 && i !== 0) {
            id += hyphen;
        } else {
            id += characters.charAt(Math.floor(Math.random() * characters.length));
        }
    }
    return id;
}

}

export function getCampaignId(): string {
  return (window as any).campaign_storage_path;
}
