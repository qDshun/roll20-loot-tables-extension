import { Injectable } from "@angular/core";
import { ReplaySubject, Subject, debounceTime, map, share, switchMap, take } from "rxjs";
import { Character, CharacterDetailsResponse, Handout, HandoutDetailsResponse } from "./types";

@Injectable({
  providedIn: 'root'
})
export class StateService {
  public responses$ = new ReplaySubject<void>();

  public campaignId: string | undefined;
  private _campaignId$ = new ReplaySubject<string>();
  public campaignId$ = this._campaignId$.asObservable();

  public characters: Character[] = [];
  private _characters$ = new ReplaySubject<Character[]>();
  public characters$ = this._characters$.asObservable();


  public handouts: Handout[] = [];
  private _handouts$ = new ReplaySubject<Handout[]>();
  public handouts$ = this._handouts$.asObservable();

  public characterDetailsResponse$ = new Subject<CharacterDetailsResponse>();
  public handoutDetailsResponse$ = new Subject<HandoutDetailsResponse>();

  public initFinished$ = this.campaignId$.pipe(
    switchMap(() =>
      this.responses$.pipe(
        debounceTime(1000),
        map(() => true),
        take(1)
      )
    ),
    share({ connector: () => new ReplaySubject(1) })
  );

  updateCharacters(characters: Character[]){
    this.characters = characters;
    this._characters$.next(characters);
    (window as any).characters = characters;
  }

  updateHandouts(handouts: Handout[]){
    this.handouts = handouts;
    this._handouts$.next(handouts);
    (window as any).handouts = handouts;
  }

  updateCampaignId(campaignId: string){
    this.campaignId = campaignId;
    this._campaignId$.next(campaignId);
  }
}

export function isCharacter(id: string){
  return (window as any).characters.findIndex((c: any) => c.id == id) != -1;
}

export function isHandout(id: string){
  return (window as any).handouts.findIndex((c: any) => c.id == id) != -1;
}
