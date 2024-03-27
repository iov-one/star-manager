import { Button, List, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import walletConnectLogo from "assets/wallet-connect.svg";
import { Block } from "components/block";
import { WalletConnectAsset } from "components/walletConnectAsset";
import locales from "locales/strings";
import React from "react";
import { WalletConnectAddressItem } from "utils/walletConnect/walletConnectAddressItem";

interface Props {
  readonly items: ReadonlyArray<WalletConnectAddressItem>;
  readonly onAddressesSelected: (
    addresses: ReadonlyArray<WalletConnectAddressItem>,
  ) => void;
  readonly onClose: () => void;
}

const useStyles = makeStyles({
  button: {
    width: 170,
    height: 40,
  },
});

const createKey = (ticker: string, address: string): string =>
  [ticker.toLowerCase(), address].join(":");

export const WalletConnectAssetList: React.FC<Props> = (
  props: Props,
): React.ReactElement | null => {
  const { items } = props;
  const [selection, setSelection] = React.useState<ReadonlyArray<string>>([]);
  const styles = useStyles();
  const setItemSelected = (key: string, selected: boolean): void => {
    const index: number = selection.findIndex((each: string): boolean => {
      const p1: string[] = each.split(":");
      const p2: string[] = key.split(":");
      return p1[0] === p2[0];
    });
    if (selected) {
      if (index !== -1) {
        if (key !== selection[index]) {
          // Update the selected items
          setSelection([
            ...selection.slice(0, index),
            key,
            ...selection.slice(index + 1),
          ]);
        }
      } else {
        setSelection([...selection, key]);
      }
    } else {
      // Update the selected items
      setSelection([
        ...selection.slice(0, index),
        ...selection.slice(index + 1),
      ]);
    }
  };
  return (
    <Paper variant={"outlined"}>
      <Block display={"flex"} alignItems={"center"} padding={24}>
        <Block marginRight={16}>
          <img
            src={walletConnectLogo}
            alt={"wallet connect logo"}
            height={24}
          />
        </Block>
        <Block>
          <Typography variant={"h5"}>
            {locales.CHOOSE_FROM_ADDRESSES}
          </Typography>
        </Block>
      </Block>
      <List>
        {items.map((item: WalletConnectAddressItem): React.ReactElement => {
          const uri: string = item.uri;
          const key: string = createKey(item.ticker, item.address);
          const { ticker } = item;
          return (
            <WalletConnectAsset
              key={key}
              address={item.address}
              selected={selection.includes(key)}
              uri={uri}
              asset={ticker.toLowerCase()}
              onClick={(selected: boolean): void =>
                setItemSelected(key, selected)
              }
            />
          );
        })}
      </List>
      <Block
        paddingLeft={24}
        paddingRight={24}
        paddingTop={16}
        paddingBottom={16}
        textAlign={"right"}
      >
        <Button
          style={{ marginRight: 8 }}
          variant={"contained"}
          color={"primary"}
          classes={{ root: styles.button }}
          onClick={(): void =>
            props.onAddressesSelected(
              items.filter((item: WalletConnectAddressItem): boolean =>
                selection.includes(createKey(item.ticker, item.address)),
              ),
            )
          }
        >
          {locales.ACCEPT}
        </Button>
        <Button
          variant={"contained"}
          color={"secondary"}
          classes={{ root: styles.button }}
          onClick={props.onClose}
        >
          {locales.CANCEL}
        </Button>
      </Block>
    </Paper>
  );
};
