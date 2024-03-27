import {
  AminoSignResponse,
  Secp256k1HdWallet,
  StdSignDoc,
} from "@cosmjs/amino";
import {
  DirectSecp256k1HdWallet,
  DirectSignResponse,
} from "@cosmjs/proto-signing";
import { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";

export type Signable = SignDoc;
export type SignResponse = DirectSignResponse | AminoSignResponse;

export const isSignDoc = (signable: any | Signable): signable is SignDoc => {
  const possibleSignDoc = signable as SignDoc;
  return (
    possibleSignDoc.accountNumber !== undefined &&
    possibleSignDoc.chainId !== undefined &&
    possibleSignDoc.authInfoBytes !== undefined &&
    possibleSignDoc.bodyBytes !== undefined
  );
};

export const isStdSignDoc = (
  signable: any | Signable,
): signable is StdSignDoc => {
  const possibleStdSignDoc = signable as StdSignDoc;
  return (
    possibleStdSignDoc.fee !== undefined &&
    possibleStdSignDoc.chain_id !== undefined &&
    possibleStdSignDoc.sequence !== undefined &&
    possibleStdSignDoc.msgs !== undefined &&
    possibleStdSignDoc.account_number !== undefined
  );
};

export const isDirectSigner = (
  signer: any | DirectSecp256k1HdWallet,
): signer is DirectSecp256k1HdWallet => {
  return "signDirect" in signer;
};

export const isAminoSigner = (
  signer: any | DirectSecp256k1HdWallet,
): signer is Secp256k1HdWallet => {
  return "signAmino" in signer;
};
