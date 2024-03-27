import { Typography } from "@material-ui/core";
import { Block } from "components/block";
import locales from "locales/strings";
import React from "react";
import { Escrow } from "types/escrow";
import { NameItem, OwnershipType } from "types/nameItem";
import { NameType } from "types/nameType";

interface Props {
  readonly item: NameItem;
  readonly escrows: ReadonlyArray<Escrow>;
}

export const ExpirationLabel: React.FC<Props> = (
  props: Props,
): React.ReactElement | null => {
  const { item, escrows } = props;
  if (item.type === NameType.Account) {
    const domainItem = item.getDomain();
    if (domainItem.type === "closed") return null;
  }
  const validUntil = (): number => {
    return item.deadline(escrows);
  };
  const isEscrow = item.getOwnership() === OwnershipType.Escrow;
  const label: string =
    Date.now() >= validUntil()
      ? isEscrow
        ? locales.ESCROW_EXPIRED
        : locales.EXPIRED_ON
      : isEscrow
      ? locales.ESCROW_DEADLINE
      : locales.EXPIRES_ON;
  const when: Date = new Date(validUntil());
  if (window.innerWidth < 880) {
    return (
      <Block marginTop={2} padding={8} paddingLeft={24} paddingRight={24}>
        <Block>
          <Typography
            variant={"subtitle2"}
            component={"span"}
            color={"textSecondary"}
          >
            {label}{" "}
          </Typography>
        </Block>
        <Block>
          <Typography variant={"subtitle2"} color={"textSecondary"}>
            <Typography component={"span"}>
              {when.toLocaleDateString()}{" "}
            </Typography>
            <Typography component={"span"}>
              {when.toLocaleTimeString()}
            </Typography>
          </Typography>
        </Block>
      </Block>
    );
  } else {
    return (
      <Block marginTop={2}>
        <Typography variant={"subtitle2"} color={"textSecondary"}>
          <Typography component={"span"}>{label} </Typography>
          <Typography component={"span"}>
            {when.toLocaleDateString()}{" "}
          </Typography>
          <Typography component={"span"}>
            {when.toLocaleTimeString()}
          </Typography>
        </Typography>
      </Block>
    );
  }
};
