export class WorldResponse {
  id!: string;
  name!: string;
  lootSources!: LootSource[];
}

export class LootSource {
  id!: string;
  name!: string;
}
