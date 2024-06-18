import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, share, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { WorldResponse } from '../models/world-response';
import { MaterializedLootSource } from '../models/materialized-loot-source.model';

@Injectable({
  providedIn: 'root'
})
export class WorldService {
  private apiService = inject(ApiService);

  private worldsUpdated$ = new BehaviorSubject<null>(null);

  worlds$ = this.worldsUpdated$.pipe(
    switchMap(() => this.getWorlds()),
    share({ connector: () => new ReplaySubject(1) })
  );

  private getWorlds(): Observable<WorldResponse[]> {
    return this.apiService.get<WorldResponse[]>('world/');
  }

  public getMaterializeLoot(lootSourceId: string, lootExpression: string){
    return this.apiService.get<MaterializedLootSource>(`dice/${lootSourceId}/${lootExpression}`);
  }
}
