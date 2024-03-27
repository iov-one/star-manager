import { AccountInfo } from "types/profile";

export class Pinata {
  static pinataCloudBaseURL = "https://gateway.pinata.cloud/ipfs/";

  getDataFromPinata = async (url: string): Promise<AccountInfo> => {
    const response = await fetch(url, {
      method: "get",
    });
    return await response.json();
  };
}
