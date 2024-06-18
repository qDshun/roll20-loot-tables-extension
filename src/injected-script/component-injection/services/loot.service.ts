import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, ReplaySubject, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { injectFromGlobalContext } from '../component-injector';
import { IdentityService } from './identity.service';

@Injectable({
  providedIn: 'root'
})
export class LootService {
  private lootTableElement!: HTMLElement;

  public selectedCharacterId$ = new BehaviorSubject<string>("");
  public angularReady$ = new ReplaySubject<void>();
  constructor() { }

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
