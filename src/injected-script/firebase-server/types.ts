export interface ServerResponse {
  type: ServerResponseType;
  data: any;
}


export type ServerResponseType = 'connect' | 'data' | 'unknown';
export type DataResponseSubtype = 'request-response' | 'path-response' | 'unknown';
export type PathResponseSubtype = 'characters' | 'handouts' | 'unknown';

export interface DataServerResponse extends ServerResponse {
  subtype: DataResponseSubtype;
}

export interface RequestResponse extends DataServerResponse {
  requestId: number;
  status: string;
}

export interface PathResponse extends DataServerResponse {
  action: string,
  subtype: 'path-response',
  pathSubtype: PathResponseSubtype;
  path: string,
  pathData: any;
}

export interface CharactersResponse extends PathResponse {
  pathSubtype: 'characters',
  characters:  ResponseDictionary<Character>;
}

export interface HandoutsResponse extends PathResponse {
  pathSubtype: 'handouts',
  handouts:  ResponseDictionary<Handout>;
}

export interface ResponseDictionary<T> {
  [characterId: string]: T;
}

export interface Handout {
  id: string;
  inplayerjournals: 'all' | string[];
  gmnotesId: number | undefined;
  notesId: number | undefined;
  controlledByIds: string[];
  name: string;
  tags: string;
}

export interface Character {
  id: string;
  avatar?: string;
  bio?: number;
  controlledby?: string;
  defaulttoken?: number;
  inplayerjournals?: string;
  name: string;
  tags: string;
}
