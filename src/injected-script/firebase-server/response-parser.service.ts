
import { InterceptedWebSocket } from "../intercepted-web-socket";
import { StateService } from "./state.service";
import { Character, CharacterDetailsResponse, CharactersResponse, DataServerResponse, HandoutDetailsResponse, HandoutsResponse, PathResponse, RequestResponse, ResponseDictionary, ServerResponse, ServerResponseType } from "./types";

export class ResponseParserService {
  constructor(private firebaseWebSocket: InterceptedWebSocket, private stateService: StateService){

  }

  processFirebaseResponse(parsed: any): ServerResponse {
    this.stateService.responses$.next();
    const serverResponse: ServerResponse = {
      type: this.mapResponseType(parsed.t),
      data: parsed.d
    }

    if (serverResponse.type == 'data') {
      const dataResponse = this.mapDataResponse(serverResponse);

      if (dataResponse.data?.r){
        return this.mapRequestResponse(dataResponse);
      }

      if (this.isPathResponse(dataResponse)){
        const pathResponse = this.mapPathResponse(dataResponse);
        if (this.isHandoutsResponse(pathResponse)){
          const handoutsResponse =  this.mapHandoutsReponse(pathResponse);
          //campaign-14599195-g5T9BBu1183YbNbSw16wSg/handouts
          this.stateService.updateHandouts(Object.values(handoutsResponse.handouts));
          this.stateService.updateCampaignId(handoutsResponse.path.split('/')[0]);
          return handoutsResponse;
        }
        if (this.isCharactersResponse(pathResponse)){
          const charactersResponse = this.mapCharactersReponse(pathResponse);
          //campaign-14599195-g5T9BBu1183YbNbSw16wSg/characters
          this.stateService.updateCampaignId(charactersResponse.path.split('/')[0]);
          this.stateService.updateCharacters(Object.values(charactersResponse.characters))
          return charactersResponse;
        }

        if (this.isCharacterDetailsResponse(pathResponse)){
          const characterResponse = this.mapCharacterDetailsReponse(pathResponse);
          this.stateService.characterDetailsResponse$.next(characterResponse);

        }
        if (this.isHandoutDetailsResponse(pathResponse)){
          const handoutResponse = this.mapHandoutDetailsReponse(pathResponse);
          this.stateService.handoutDetailsResponse$.next(handoutResponse);
        }


        return pathResponse;
      }

      return dataResponse;
    }
    return serverResponse;
  }

  isPathResponse  = (response: DataServerResponse) => (response.data?.a && response.data?.b?.p)

  isHandoutsResponse  = (response: PathResponse) => response.path.indexOf('/handouts') != -1;
  isCharactersResponse = (response: PathResponse) => response.path.indexOf('/characters') != -1;
  isCharacterDetailsResponse = (response: PathResponse) => response.path.indexOf('/char-attribs') != -1 && response.path.split('char/')[1].indexOf('/') == -1;
  isHandoutDetailsResponse = (response: PathResponse) => response.path.indexOf('/hand-blobs') != -1;

  private mapHandoutDetailsReponse(response: PathResponse): HandoutDetailsResponse {
    return {
      ...response,
      pathSubtype: 'handout-details',
      text: unescape(response.pathData)
    }
  }

  private mapCharacterDetailsReponse(response: PathResponse): CharacterDetailsResponse {
    return {
      ...response,
      pathSubtype: 'character-details',
      values: response.pathData
    }
  }

  private mapCharactersReponse(response: PathResponse): CharactersResponse {
    return {
      ...response,
      pathSubtype: 'characters',
      characters: response.pathData
    }
  }

  private mapHandoutsReponse(response: PathResponse): HandoutsResponse {
    return {
      ...response,
      pathSubtype: 'handouts',
      handouts: response.pathData
    }
  }

  private mapPathResponse(response: DataServerResponse): PathResponse {
    if (!this.isPathResponse(response)){
      throw new Error(`${response} is not PathResponse`);
    }
    return {
      ...response,
      subtype: 'path-response',
      action: response.data.a,
      pathSubtype: 'unknown',
      path: response.data.b.p,
      pathData: response.data.b.d
    }
  }

  private mapDataResponse(response: ServerResponse): DataServerResponse {
    if (response.type != 'data') {
      throw new Error(`${response} is not DataServerResponse`);
    }

    return {
      ...response,
      subtype: 'unknown'
    }
  }

  private mapRequestResponse(response: DataServerResponse): RequestResponse {
    if (!response.data?.r) {
      throw new Error(`${response} is not RequestResponse`);
    }

    return {
      ...response,
      requestId: response.data?.r,
      status: response.data?.b?.s,
      subtype: 'request-response',
    }
  }

  private mapResponseType(responseType: string): ServerResponseType {
    switch(responseType){

      case ('c'):
        return 'connect';

      case ('d'):
        return 'data';

      default:
        return 'unknown';
    }
  }
}
