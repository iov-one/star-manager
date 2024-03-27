import config from "config";
import { PinataJSONHash } from "types/pinata";
import { OffChainProfile, Profile } from "types/profile";

export class PinataError extends Error {
  constructor(message: string) {
    super();
    this.message = message;
  }
}

export class Pinata {
  // eslint-disable-next-line no-undef
  requestHeaders: HeadersInit;
  static pinataCloudBaseURL = "https://gateway.pinata.cloud/ipfs/";

  constructor() {
    const { pinataConfig } = config;
    this.requestHeaders = {
      pinata_api_key: pinataConfig.apiKey,
      pinata_secret_api_key: pinataConfig.secretKey,
    };
  }

  addToPinata = async (
    data: OffChainProfile,
    file: File | null,
    imageURL: string | null,
  ): Promise<PinataJSONHash> => {
    if (file !== null) {
      const imageHash: PinataJSONHash = await this.addImageToPinata(file);
      const imageURL = Pinata.pinataCloudBaseURL + imageHash.IpfsHash;
      return await this.addDataToPinata(data, imageURL);
    } else if (imageURL === "") {
      return await this.addDataToPinata(data, null);
    } else {
      return await this.addDataToPinata(data, imageURL);
    }
  };

  removeLastData = async (dataURL: string): Promise<number> => {
    // If there is nothing store initially
    if (dataURL === "") {
      // Return a fake promise
      return new Promise<number>((resolve) => {
        resolve(0);
      });
    }
    const hash = dataURL.substr(
      Pinata.pinataCloudBaseURL.length,
      dataURL.length,
    );
    const endPoint = "https://api.pinata.cloud/pinning/unpin/";
    const response = await fetch(endPoint + hash, {
      method: "delete",
      headers: this.requestHeaders,
    });
    if (response.status !== 200) throw new PinataError("failed unpinning data");
    return response.status;
  };

  addDataToPinata = async (
    data: OffChainProfile,
    imageURL: string | null,
  ): Promise<PinataJSONHash> => {
    const endPoint = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
    const body: OffChainProfile = {
      ...data,
      photo: imageURL,
    };
    const response = await fetch(endPoint, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        ...this.requestHeaders,
      },
      body: JSON.stringify(body),
    });
    if (response.status > 199 && response.status < 300)
      return await response.json();
    throw new PinataError("failed pinning data");
  };

  addImageToPinata = async (file: File): Promise<PinataJSONHash> => {
    const endPoint = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    const data = new FormData();
    data.append("file", file);

    const response = await fetch(endPoint, {
      method: "post",
      headers: this.requestHeaders,
      body: data,
    });
    if (response.status > 199 && response.status < 300)
      return await response.json();
    throw new PinataError("failed pinning file");
  };

  getDataFromPinata = async (url: string): Promise<Profile> => {
    const response = await fetch(url, {
      method: "get",
    });
    return await response.json();
  };
}
