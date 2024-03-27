export interface GenericSocialClaimVerificationResponse {
  verified: boolean;
  err?: string;
}

export interface TwitterClaimVerificationResponse
  extends GenericSocialClaimVerificationResponse {
  active: boolean;
}

export interface InstagramClaimVerificationResponse
  extends GenericSocialClaimVerificationResponse {}
