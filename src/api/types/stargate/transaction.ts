import { EncodeObject } from "@cosmjs/proto-signing";
import {
  Attribute,
  Event,
  isMsgBeginRedelegateEncodeObject,
  isMsgDelegateEncodeObject,
  isMsgSendEncodeObject,
  isMsgUndelegateEncodeObject,
} from "@cosmjs/stargate";
import { Log } from "@cosmjs/stargate/build/logs";
import api from "api";
import { StargateBaseTx } from "api/types/stargate/searchTxResponse";
import { TokenLike } from "config";
import { Distribution, TxType } from "signers/starnameRegistry";
import { Amount } from "types/amount";
import { ITransaction as Transaction } from "types/transaction";
import { getEscrow, getValidator, reverseLookup } from "utils/getTransaction";

export class StargateTransaction {
  static async fromCreateEscrowBaseTx(
    baseTx: StargateBaseTx<EncodeObject>,
  ): Promise<Transaction> {
    const { tx, timestamp, logs } = baseTx;
    const {
      body,
      auth_info: { fee },
    } = tx;
    const { messages, memo } = body;
    const msg = messages[0];
    const { value } = msg;
    const starnameSellPrice = value.price[0];
    const token: TokenLike | undefined = api.getToken(starnameSellPrice.denom);
    if (token === undefined)
      throw new Error(
        "price has invalid token subunit '" + starnameSellPrice.denom + "'",
      );
    const log = logs[0];
    const event = log.events.find((e) => e.type.includes("EventCreatedEscrow"));
    if (event === undefined)
      throw new Error("cant find escrow created event in tx");
    const idAttribute = event.attributes.find((attr) => attr.key === "id");
    if (idAttribute === undefined)
      throw new Error("cant find id attributed in create event in tx");
    return {
      amount: [new Amount(Number(starnameSellPrice.amount), token)],
      fee: api.toInternalCoins(fee.amount),
      data: value.object,
      seller: await reverseLookup(value.seller),
      id: baseTx.txhash,
      type: msg.typeUrl,
      escrowId: idAttribute.value.replace(/['"]+/g, ""),
      note: memo,
      time: new Date(timestamp),
      deadline: new Date(parseInt(value.deadline) * 1000),
    };
  }

  static async fromUpdateEscrowBaseTx(
    baseTx: StargateBaseTx<EncodeObject>,
  ): Promise<Transaction> {
    const { tx, timestamp } = baseTx;
    const {
      body,
      auth_info: { fee },
    } = tx;
    const { messages, memo } = body;
    const msg = messages[0];
    const { value } = msg;
    let showcaseData = `#${value.id}`;
    try {
      const escrowObj = (await getEscrow(value.id)).object;
      showcaseData = api.escrowObjectToStarname(escrowObj);
    } catch (error) {
      console.warn("cant find escrow with id:" + value.id);
    }
    const starnameSellPrice = value.price[0];
    const token: TokenLike | undefined = api.getToken(starnameSellPrice.denom);
    if (token === undefined)
      throw new Error(
        "price has invalid token subunit '" + starnameSellPrice.denom + "'",
      );
    return {
      amount: [new Amount(Number(starnameSellPrice.amount), token)],
      fee: api.toInternalCoins(fee.amount),
      data: showcaseData,
      seller: await reverseLookup(value.seller),
      id: baseTx.txhash,
      type: msg.typeUrl,
      note: memo,
      updater: await reverseLookup(value.updater),
      time: new Date(timestamp),
      deadline: new Date(parseInt(value.deadline) * 1000),
    };
  }

  static async fromRefundEscrowBaseTx(
    baseTx: StargateBaseTx<EncodeObject>,
  ): Promise<Transaction> {
    const { tx, timestamp } = baseTx;
    const {
      body,
      auth_info: { fee },
    } = tx;
    const { messages, memo } = body;
    const msg = messages[0];
    const { value } = msg;
    return {
      amount: [Amount.fromValue(0)],
      fee: api.toInternalCoins(fee.amount),
      data: value.id,
      sender: await reverseLookup(value.sender),
      id: baseTx.txhash,
      type: msg.typeUrl,
      note: memo,
      time: new Date(timestamp),
    };
  }

  static async fromTransferToEscrowBaseTx(
    baseTx: StargateBaseTx<EncodeObject>,
  ): Promise<Transaction> {
    const { tx, timestamp } = baseTx;
    const {
      body,
      auth_info: { fee },
    } = tx;
    const { messages, memo } = body;
    const msg = messages[0];
    const { value } = msg;
    const transferAmount = value.amount[0];
    const token: TokenLike | undefined = api.getToken(transferAmount.denom);
    if (token === undefined)
      throw new Error(
        "price has invalid token subunit '" + transferAmount.denom + "'",
      );
    return {
      amount: [new Amount(Number(transferAmount.amount), token)],
      fee: api.toInternalCoins(fee.amount),
      data: `#${value.id}`,
      id: baseTx.txhash,
      type: msg.typeUrl,
      note: memo,
      time: new Date(timestamp),
      buyer: await reverseLookup(value.sender),
    };
  }

  static async fromStarnameBaseTx(
    baseTx: StargateBaseTx<EncodeObject>,
  ): Promise<Transaction> {
    const { logs } = baseTx;
    const log: Log = logs[0];
    const { events } = log;
    const transfer: Event | undefined = events.find(
      (event: Event) => event.type === "transfer",
    );
    if (transfer === undefined)
      throw new Error("there are not transfers in the log events");
    const attributes: ReadonlyArray<Attribute> = transfer.attributes;
    const amount: Attribute | undefined = attributes.find(
      (attr: Attribute): boolean => attr.key === "amount",
    );
    if (amount === undefined)
      throw new Error("there is no amount in this transfer event");
    const sender: Attribute | undefined = attributes.find(
      (attr: Attribute): boolean => attr.key === "sender",
    );
    if (sender === undefined)
      throw new Error("cannot find a sender for this transfer event");
    const { value } = amount;
    const unit: string = value.replace(/[0-9]+/, "");
    const token: TokenLike | undefined = api.getToken(unit);
    if (token === undefined)
      throw new Error("value has invalid token subunit `" + unit + "'");
    const { tx, timestamp } = baseTx;
    const { body } = tx;
    const { messages, memo } = body;
    const msg = messages[0];
    const {
      auth_info: { fee },
    } = tx;
    return {
      amount: [new Amount(Number(value.replace(unit, "")), token)],
      fee: api.toInternalCoins(fee.amount),
      data: msg.value,
      sender: await reverseLookup(sender.value),
      id: baseTx.txhash,
      type: msg.typeUrl,
      time: new Date(timestamp),
      note: memo,
    };
  }

  static async fromSendBaseTx(
    baseTx: StargateBaseTx<EncodeObject>,
    sender: string,
  ): Promise<Transaction> {
    const { tx, timestamp } = baseTx;
    const { body } = tx;
    const { messages, memo } = body;
    const message = messages[0];
    const { value } = message;
    const {
      auth_info: { fee },
    } = tx;
    if (!isMsgSendEncodeObject(message))
      throw new Error("cannot parse transaction");

    return {
      amount: api.toInternalCoins(value.amount),
      fee: api.toInternalCoins(fee.amount),
      data: await reverseLookup(value.to_address),
      sender: await reverseLookup(value.from_address),
      id: baseTx.txhash,
      type:
        sender === value.to_address ? TxType.Virtual.Receive : TxType.Bank.Send,
      note: memo,
      time: new Date(timestamp),
    };
  }

  static async fromDistributionBaseTx(
    baseTx: StargateBaseTx<EncodeObject>,
  ): Promise<Transaction> {
    const { tx, timestamp, logs } = baseTx;
    const { body } = tx;
    const { messages, memo } = body;
    const rewardsValidatorData = messages.map(({ typeUrl, value }) => {
      if (typeUrl !== Distribution.WithdrawDelegatorReward)
        throw new Error("cannot parse transaction");
      if (!value.validator_address)
        throw new Error("cant find validator address");
      if (!value.delegator_address)
        throw new Error("cant find delegator address");
      return {
        validator_address: value.validator_address as string,
        delegator_address: value.delegator_address as string,
      };
    });
    const delegatorAddress = rewardsValidatorData[0].delegator_address;
    const validatorsData = await Promise.all(
      rewardsValidatorData.map((data) => getValidator(data.validator_address)),
    );

    const tokens = logs.reduce((acc, log) => {
      const { events } = log;
      const withDrawEvent: Event | undefined = events.find(
        (event: Event) => event.type === "withdraw_rewards",
      );
      if (withDrawEvent === undefined)
        throw new Error("cant find withdraw_rewards event");
      const amountAttr = withDrawEvent.attributes.find(
        (at) => at.key === "amount",
      );
      if (amountAttr === undefined)
        throw new Error("cant find amount attribute");
      const match = amountAttr.value.match(/^([0-9]+)([a-zA-Z]+)/);
      if (!match) throw new Error("Got an invalid coin string");
      return acc + parseInt(match[1].replace(/^0+/, "") || "0");
    }, 0);

    const message = messages[0];
    const {
      auth_info: { fee },
    } = tx;

    return {
      amount: [Amount.from(tokens)],
      fee: api.toInternalCoins(fee.amount),
      data: validatorsData.map((v) => v.description.moniker).join(","),
      sender: await reverseLookup(delegatorAddress),
      id: baseTx.txhash,
      type: message.typeUrl,
      time: new Date(timestamp),
      note: memo,
    };
  }

  static async fromRedelegateBaseTx(
    baseTx: StargateBaseTx<EncodeObject>,
  ): Promise<Transaction> {
    const { tx, timestamp } = baseTx;
    const { body } = tx;
    const { messages, memo } = body;
    const message = messages[0];
    const { value } = message;
    const {
      auth_info: { fee },
    } = tx;

    if (!isMsgBeginRedelegateEncodeObject(message)) {
      throw new Error("cannot parse transaction");
    }
    return {
      amount: api.toInternalCoins([value.amount]),
      fee: api.toInternalCoins(fee.amount),
      data: {
        src: await getValidator(value.validator_src_address),
        dst: await getValidator(value.validator_dst_address),
      },
      sender: await reverseLookup(value.delegator_address),
      id: baseTx.txhash,
      type: message.typeUrl,
      time: new Date(timestamp),
      note: memo,
    };
  }

  static async fromStakingBaseTx(
    baseTx: StargateBaseTx<EncodeObject>,
  ): Promise<Transaction> {
    const { tx, timestamp } = baseTx;
    const { body } = tx;
    const { messages, memo } = body;
    const message = messages[0];
    const { value } = message;
    const {
      auth_info: { fee },
    } = tx;
    if (
      !isMsgDelegateEncodeObject(message) &&
      !isMsgUndelegateEncodeObject(message)
    ) {
      throw new Error("cannot parse transaction");
    }
    return {
      amount: api.toInternalCoins([value.amount]),
      fee: api.toInternalCoins(fee.amount),
      data: await getValidator(value.validator_address),
      sender: await reverseLookup(value.delegator_address),
      id: baseTx.txhash,
      type: message.typeUrl,
      time: new Date(timestamp),
      note: memo,
    };
  }
}
