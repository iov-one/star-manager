import { GoogleAuthInfo, Signer, SignerState } from "@iov/gdrive-custodian";
import { VoidCallback } from "@iov/gdrive-custodian/lib/types/voidCallback";
import config from "config";
import { GOOGLE_DRIVE_REQUEST_AUTHORIZATION_TO_SIGN } from "routes/paths";

function assertSignerIsValid(
  signer: Signer | undefined,
): asserts signer is Signer {
  if (signer === undefined) {
    throw new Error(
      "cannot call a method because the signer was never defined",
    );
  }
}

export class GDriveCustodian {
  private authInfo?: GoogleAuthInfo;
  protected signer?: Signer;

  public initialized = true;

  public static create(): GDriveCustodian {
    const custodian = new GDriveCustodian();
    custodian.signer = new Signer({
      authorization: {
        path: GOOGLE_DRIVE_REQUEST_AUTHORIZATION_TO_SIGN,
      },
      googleClientID: config.googleOAuthClientId,
      mnemonicLength: config.gdriveMnemonicLength as 12 | 24,
      twoFactorAuthUrls: config.twoFactorAuthUrls,
    });
    custodian.initialized = false;
    return custodian;
  }

  public attach(): Promise<void> {
    const { signer } = this;
    assertSignerIsValid(signer);
    return signer.attach();
  }

  public setStateChangeListener(
    listener: (state: SignerState, data?: any) => void,
  ): void {
    const { signer } = this;
    assertSignerIsValid(signer);
    signer.setStateChangeListener(listener);
  }

  public removeStateChangeListener(): void {
    const { signer } = this;
    assertSignerIsValid(signer);
    signer.removeStateChangeListener();
  }

  public connect(button: HTMLElement): VoidCallback {
    const { signer } = this;
    assertSignerIsValid(signer);
    return signer.connect();
  }

  public detach(): void {
    const { signer } = this;
    assertSignerIsValid(signer);
    return signer.detach();
  }

  public getSigner(): Signer {
    const { signer } = this;
    assertSignerIsValid(signer);
    return signer;
  }

  public getIdToken(): string {
    if (this.initialized) {
      throw new Error("it's the default thing, why do we actually need it?");
    }
    const { authInfo } = this;
    if (authInfo !== undefined) {
      const { accessToken } = authInfo;
      return accessToken.idToken;
    } else {
      throw new Error("did you sign in with google?");
    }
  }

  public authenticateWith2fa(token: string): Promise<void> {
    const { signer } = this;
    assertSignerIsValid(signer);
    return signer.authenticate2faUser(
      JSON.stringify({ idToken: this.getIdToken(), token }),
    );
  }

  public validateWith2fa(token: string): Promise<boolean> {
    const { signer } = this;
    assertSignerIsValid(signer);
    return signer.validate2faUser(
      JSON.stringify({ idToken: this.getIdToken(), token }),
    );
  }

  public setAuthInfo(authInfo: GoogleAuthInfo): void {
    this.authInfo = authInfo;
  }
}
