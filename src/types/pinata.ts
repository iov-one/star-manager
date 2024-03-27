export interface PinataConfig {
  apiKey: string;
  secretKey: string;
}

export interface PinataJSONHash {
  readonly IpfsHash: string;
  readonly PinSize: number;
  readonly Timestamp: string;
}
