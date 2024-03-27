export interface Domain {
  readonly kind: "domain";
  readonly owner: string;
  readonly name: string;
  readonly admin: string;
  readonly validUntil: number;
  readonly type: string;
  readonly broker?: string;
}

export interface DomainInfo {
  readonly name: string;
  readonly admin: string;
  readonly valid_until: number;
  readonly type: string;
  readonly broker: string;
}

export interface ApiDomain {
  readonly owner: string;
  readonly name: string;
  readonly admin: string;
  readonly valid_until: number;
  readonly type: string;
  readonly broker?: string;
}

export interface DomainsResponse {
  readonly height: number;
  readonly result: {
    readonly Domains: ReadonlyArray<ApiDomain>;
  };
}

export const isDomain = (obj: Domain | any): obj is Domain => {
  return obj.kind === "domain";
};
