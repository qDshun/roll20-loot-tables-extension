import { ApplicationConfig, EnvironmentInjector, ProviderToken, provideZoneChangeDetection } from '@angular/core';
import { LootTableSelectorComponent } from './loot-table-selector/loot-table-selector.component';
import { bootstrapApplication } from '@angular/platform-browser';
import { LootService } from './services/loot.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './interceptors';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export async function injectLootTableDropdown(querySelector: string): Promise<HTMLElement>{
  const selector = 'app-loot-table-selector';
  const parentElemnt = document.querySelector(querySelector);
  if (!parentElemnt){
    throw new Error(`Parent element not found!`);
  }
  var placeholderElement = document.createElement(selector);
  parentElemnt.prepend(placeholderElement);
  const appRef = await bootstrapApplication(LootTableSelectorComponent, appConfig);
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

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync('noop'),
    // { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ]
};
