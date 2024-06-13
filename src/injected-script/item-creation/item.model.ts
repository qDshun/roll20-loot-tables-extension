export class InventoryItem {
  constructor (
    public name: string,
    public location: string,
    public count: number = 1,
    public cost: number = 0,
    public weight: number = 0,
    public notes?: string
  ) { }
}
