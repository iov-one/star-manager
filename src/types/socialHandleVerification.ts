export interface SocialHandleVerification {
  readonly verified: boolean;
  readonly url: string | null;
  readonly error?: string | null;
}
