import config from "config";
import { SocialHandleVerification } from "types/socialHandleVerification";

export class TwitterVerifier {
  public async verify(
    handle: string,
    starname: string,
    text: string,
  ): Promise<SocialHandleVerification> {
    return new Promise(
      (
        resolve: (result: SocialHandleVerification) => void,
        reject: (error: any) => void,
      ) => {
        const url = config.twitterVerifierUrl + handle + `/${starname}`;
        fetch(url, {
          method: "POST",
          body: JSON.stringify({
            message: text,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response: Response): Promise<any> => {
            return response.json();
          })
          .then((verification: SocialHandleVerification): void => {
            resolve(verification);
          })
          .catch((error: any): void => {
            reject(error);
          });
      },
    );
  }
}

export class InstagramVerifier {
  public async verify(
    handle: string,
    starname: string,
    code: string,
    redirect_uri: string,
  ): Promise<SocialHandleVerification> {
    return new Promise(
      (
        resolve: (result: SocialHandleVerification) => void,
        reject: (error: any) => void,
      ) => {
        const url = config.instagramConfig.requestUrl + handle + `/${starname}`;
        fetch(url, {
          method: "POST",
          body: JSON.stringify({
            code,
            redirect_uri: window.location.origin + redirect_uri,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response: Response): Promise<any> => {
            return response.json();
          })
          .then((verification: SocialHandleVerification): void => {
            resolve(verification);
          })
          .catch((error: any): void => {
            reject(error);
          });
      },
    );
  }
}
