import { Typography } from "@material-ui/core";
import api from "api";
import { Block } from "components/block";
import locales from "locales/strings";
import React from "react";
import { Amount } from "types/amount";
import { Balance } from "types/balance";
import { Reward } from "types/rewardsResponse";
import { Unbonding } from "types/unbondingsResponse";
import { Delegation } from "types/userDelegationsResponse";
import { getAsset } from "utils/getAsset";

interface Props {
  readonly balances: ReadonlyArray<Balance>;
  readonly delegations?: ReadonlyArray<Delegation>;
  readonly unbondings?: ReadonlyArray<Unbonding>;
  readonly rewards?: ReadonlyArray<Reward>;
}

interface OtherBalance {
  label: string;
  value: string;
}

export const BalancesList: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { balances, delegations, unbondings, rewards } = props;
  const defaultState = "...";

  const [delegationTotal, setDelegationTotal] =
    React.useState<string>(defaultState);
  const [unbondingTotal, setUnbondingTotal] =
    React.useState<string>(defaultState);
  const [rewardsTotal, setRewardsTotal] = React.useState<string>(defaultState);

  React.useEffect(() => {
    if (delegations) {
      setDelegationTotal(
        delegations
          .reduce((prev, delegation) => {
            const token = api.getToken(delegation.balance.denom);
            if (token) {
              const amount = new Amount(
                Number(delegation.balance.amount),
                token,
              );
              return prev + amount.getFractionalValue();
            }
            return prev;
          }, 0)
          .toFixed(2),
      );
    }

    if (unbondings) {
      setUnbondingTotal(
        unbondings
          .reduce(
            (prev, unbonding) =>
              prev +
              unbonding.entries.reduce((pre, entry) => {
                const amount = new Amount(
                  Number(entry.balance),
                  api.getMainToken(),
                );
                return pre + amount.getFractionalValue();
              }, 0),
            0,
          )
          .toFixed(2),
      );
    }

    if (rewards) {
      const mainToken = api.getMainToken();
      setRewardsTotal(
        rewards
          .reduce((acc, rew) => {
            const mainReward = rew.reward.find(
              (_c) => _c.denom === mainToken.subunitName,
            );
            if (!mainReward) return acc;
            return (
              acc + Amount.from(Number(mainReward.amount)).getFractionalValue()
            );
          }, 0)
          .toFixed(2),
      );
    }
  }, [delegations, unbondings, rewards]);

  const otherBalances = (): React.ReactChild | null => {
    const otherBalancesData: ReadonlyArray<OtherBalance> = [
      {
        label: locales.DELEGATED,
        value: delegationTotal,
      },
      {
        label: locales.UNBONDING,
        value: unbondingTotal,
      },
      {
        label: locales.REWARDS,
        value: rewardsTotal,
      },
    ];

    return (
      <>
        <Block className={"balance-view-title"}>
          <Typography variant={"subtitle1"}>
            {locales.OTHER_BALANCE.toUpperCase()}
          </Typography>
        </Block>
        {otherBalancesData.map((balance: OtherBalance, idx: number) => (
          <Block key={idx} className={"other-balance-view-balance-entry"}>
            <Block className={"other-balance-view-balance-entry-description"}>
              <Block
                className={
                  "other-balance-view-balance-entry-description-ticker"
                }
              >
                {balance.label}
              </Block>
            </Block>
            <Block className={"other-balance-view-balance-entry-amount"}>
              <Typography variant={"h6"} color={"primary"}>
                {balance.value}
              </Typography>
            </Block>
          </Block>
        ))}
      </>
    );
  };

  return (
    <>
      <Block className={"balance-view-title"}>
        <Typography variant={"subtitle1"}>{locales.YOUR_FUNDS}</Typography>
      </Block>
      {balances.map((balance: Balance): React.ReactElement => {
        const { amount } = balance;
        const { token } = amount;
        const value: number = amount.getFractionalValue();
        const asset = getAsset(token.ticker);
        return (
          <Block key={asset.name} className={"balance-view-balance-entry"}>
            <Block className={"balance-view-balance-entry-icon"}>
              <img src={asset.logo} alt={"currency"} />
            </Block>
            <Block className={"balance-view-balance-entry-description"}>
              <Block
                className={"balance-view-balance-entry-description-ticker"}
              >
                {asset.name}
              </Block>
            </Block>
            <Block className={"balance-view-balance-entry-amount"}>
              <Typography variant={"h4"} color={"primary"}>
                {value.toFixed(2)}
              </Typography>
            </Block>
          </Block>
        );
      })}
      {delegations || unbondings || rewards ? otherBalances() : null}
    </>
  );
};
