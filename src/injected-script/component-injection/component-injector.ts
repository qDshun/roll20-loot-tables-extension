import { EnvironmentInjector, ProviderToken, inject } from '@angular/core';
import { LootTableSelectorComponent } from './loot-table-selector/loot-table-selector.component';
import { bootstrapApplication } from '@angular/platform-browser';
import { LootService } from './services/loot.service';

export async function injectLootTableDropdown(querySelector: string): Promise<HTMLElement>{
  const selector = 'app-loot-table-selector';
  const parentElemnt = document.querySelector(querySelector);
  if (!parentElemnt){
    throw new Error(`Parent element not found!`);
  }
  var placeholderElement = document.createElement(selector);
  parentElemnt.prepend(placeholderElement);
  const appRef = await bootstrapApplication(LootTableSelectorComponent);
  storeInjectorRefGlobally(appRef.injector);
  getInjectorRef().get(LootService).saveLootTableRef(placeholderElement);
  return placeholderElement;
}

function storeInjectorRefGlobally(injector: EnvironmentInjector){
  (window as any).angularInjectorRef = injector;
}

export function getInjectorRef(){
  return (window as any).angularInjectorRef as EnvironmentInjector;
}

export function injectFromGlobalContext<T>(token: ProviderToken<T>): T{
  return getInjectorRef().get<T>(token)
}
