interface Check2faResponse {
  readonly result: boolean;
}

interface Register2faResponse {
  readonly secret: string;
  readonly authurl: string;
}

interface Verify2faResponse {
  readonly verified: boolean;
}

interface Remove2faResponse {
  readonly removed?: boolean;
  readonly error?: string;
}

export interface Check2faData extends Check2faResponse {}
export interface Register2faData extends Register2faResponse {}
export interface Verify2faData extends Verify2faResponse {}
export interface Remove2faData extends Remove2faResponse {}
