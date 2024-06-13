import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LootService {
  private selectedCharacterId = '';
  private lootTableElement!: HTMLElement;
  private selectedCharacterId$ = new BehaviorSubject("");

  public angularReady$ = new ReplaySubject<void>();
  constructor() { }

  test(){
    console.log('variable', this.lootTableElement);
  }

  saveLootTableRef(lootTableElement: HTMLElement) {
    this.lootTableElement = lootTableElement;
  }

  hideLootSelection() {
    this.lootTableElement.style.display = 'none';
  }

  showLootSelection() {
    this.lootTableElement.style.display = 'block';
  }
}
