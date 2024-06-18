export class MaterializedLootSource {
  id!: string;
  expression!: string;
  count!: number;
  materializedLootItems!: MaterializedLootItem[]
}

export class MaterializedLootItem {
  id!: string;
  name!: string;
  cost!: number;
  weight!: number;
  description!: string;
  count!: number;
}
