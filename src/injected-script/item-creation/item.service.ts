import { Observable, from } from "rxjs";
import { InventoryItem } from "./item.model";
import { InterceptedWebSocket } from "../intercepted-web-socket";

export class ItemService {

  private readonly campaignId = '14599195-g5T9BBu1183YbNbSw16wSg';
  private readonly characterId = '-NuKtg7m56I2B4RGIFXQ';
  constructor (private firebaseWebSocket: InterceptedWebSocket) { }
  async createItemFromName(itemName: string, itemLocation: string, itemNotes: string){
    this.saveItem(new InventoryItem(itemName, itemLocation, 1, 0, 0, itemNotes));
  }

  saveItem(item: InventoryItem): Observable<void> {
    return from(this.saveItemAsync(item));
  }

  private async saveItemAsync(item: InventoryItem){
    const rowId = this.generateFieldId();

    this.saveItemFieldAsync(this.campaignId, this.characterId, rowId, 'name', item.name);
    this.saveItemFieldAsync(this.campaignId, this.characterId, rowId, 'location', item.location);
    this.saveItemFieldAsync(this.campaignId, this.characterId, rowId, 'cost', item.cost);
    this.saveItemFieldAsync(this.campaignId, this.characterId, rowId, 'weight', item.weight);
    this.saveItemFieldAsync(this.campaignId, this.characterId, rowId, 'count', item.count);
    if (item.notes)
      this.saveItemFieldAsync(this.campaignId, this.characterId, rowId, 'notes', item.notes);
  }

  private async saveItemFieldAsync(campaignId: string, characterId: string, rowId: string, fieldName: string, fieldValue: string | number){
    const requestId = this.firebaseWebSocket.getRequestId();
    const fieldCreationMessage = this.getFieldCreationMessage(campaignId, characterId, this.generateFieldId(), rowId, fieldName, fieldValue.toString(), requestId);
    await this.firebaseWebSocket.sendAsync(fieldCreationMessage, requestId);
  }

  private getFieldCreationMessage(campaignId: string, characterId: string, fieldId: string, rowId: string, attributeName: string, attributeValue: string, requestId: number){
    return `{"t":"d","d":{"r":${requestId},"a":"m","b":{"p":"/campaign-${campaignId}/char-attribs/char/${characterId}/${fieldId}",
    "d":{"name":"repeating_item_${rowId}_${attributeName}","current":"${attributeValue}","id":"${fieldId}"}}}}`;
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
