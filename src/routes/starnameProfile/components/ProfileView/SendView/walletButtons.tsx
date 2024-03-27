import locales from "locales/strings";
import React from "react";
import { WalletUri } from "routes/starnameProfile/wallets";

import { WalletButton } from "./walletButton";

interface Props {
  readonly items: ReadonlyArray<WalletUri>;
  readonly asset: string;
  readonly starname: string;
  readonly address: string;
  readonly amount: number;
}

export const WalletButtons: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { items, asset, address } = props;
  const [availableWallets, setAvailableWallets] = React.useState<
    ReadonlyArray<WalletUri>
  >([]);

  React.useEffect(() => {
    setAvailableWallets(
      items.filter((wallet: WalletUri) => {
        return wallet.isAvailableForAsset(asset);
      }),
    );
  }, [items, asset]);

  return (
    <div className={"resources-list"}>
      {availableWallets.length > 0 ? (
        <h4>{locales.PAY_WITH_YOUR_WALLET}</h4>
      ) : null}
      {availableWallets.map(
        (item: WalletUri): React.ReactElement => (
          <WalletButton
            key={item.name}
            item={item}
            asset={asset}
            address={address}
            amount={props.amount}
            starname={props.starname}
          />
        ),
      )}
    </div>
  );
};
