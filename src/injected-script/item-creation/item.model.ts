import { FieldResponse } from "../firebase-server/types";

export class InventoryItem {
  constructor (
    public name?: string,
    public location?: string,
    public count?: number,
    public cost?: number,
    public weight?: number,
    public notes?: string
  ) { }
}

export class CreateItemRequest {
  characterId!: string;
  item!: InventoryItem;
  updateSingleField?: string;
}
export class UpdateSingleFieldRequest {
  characterId!: string;
  field!: FieldResponse;
  newValue!: string;
}
export class UpdateHandoutRequest {
  handoutId!: string;
  newValue!: string;
}
