import "./style.scss";

import { Asset } from "@iov/asset-directory";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Menu,
  MenuItem,
  OutlinedInput,
  Select,
} from "@material-ui/core";
import { AddCircle } from "@material-ui/icons";
import { makeStyles } from "@material-ui/styles";
import { DialogTitle } from "@mui/material";
import { Block } from "components/block";
import { PROFILE_BLOCKCHAIN_ADDRESS_INPUT_TESTID } from "constants/profileTestIds";
import { useWallet } from "contexts/walletContext";
import locales from "locales/strings";
import React from "react";
import { SignerType } from "signers/signerType";
import theme from "theme";
import { ResourceInfo } from "types/resourceInfo";

import { CurrencyDropdownItem } from "../../CurrencyDropdownItem";
import CosmosAddUtility from "./CosmosAddUtility";

interface Props {
  readonly resources: ReadonlyArray<ResourceInfo>;
  readonly availableAssets: ReadonlyArray<Asset>;
  readonly onAddResource: (symbol: string, address: string) => void;
  readonly onAddWithWalletConnect: () => void;
}

const useStyles = makeStyles({
  chip: {
    margin: theme.spacing(0.5),
    width: theme.spacing(15),
  },
});

export const AddResourceButton: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const styles = useStyles();
  const wallet = useWallet();
  const { availableAssets, onAddResource, onAddWithWalletConnect, resources } =
    props;
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [cosmosUtilityDialogOpen, setCosmosUtilityDialogOpen] =
    React.useState<boolean>(false);
  const [address, setAddress] = React.useState<string | null>(null);
  const [newCurrencyAssetSymbol, setNewCurrencyAssetSymbol] = React.useState<
    string | null
  >(null);
  const handleAddClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleAddWithWalletConnect = (): void => {
    setAnchorEl(null);
    onAddWithWalletConnect();
  };

  const handleAddManually = (): void => {
    setAnchorEl(null);
    setDialogOpen(true);
  };

  const handleAddWithCosmosAssetAddUtility = (): void => {
    setAnchorEl(null);
    setCosmosUtilityDialogOpen(true);
  };

  const handleDialogClose = (): void => {
    setDialogOpen(false);
  };

  const onAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setAddress(event.target.value);
  };

  const onSelectChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>,
  ): void => {
    const { value } = event.target;
    setNewCurrencyAssetSymbol(value as string);
  };

  const handleAddCurrency = (): void => {
    if (newCurrencyAssetSymbol && address) {
      onAddResource(newCurrencyAssetSymbol, address);
    }
    setNewCurrencyAssetSymbol(null);
    setAddress(null);
    setDialogOpen(false);
  };
  return (
    <>
      <Chip
        className={styles.chip}
        color={"primary"}
        icon={<AddCircle />}
        label={locales.ADD_MORE}
        onClick={handleAddClick}
      />
      <Menu
        open={!!anchorEl}
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
        onClose={() => setAnchorEl(null)}
      >
        {wallet.getSignerType() === SignerType.Keplr ||
        wallet.getSignerType() === SignerType.Google ? (
          <MenuItem onClick={handleAddWithCosmosAssetAddUtility}>
            {locales.ADD_COSMOS_ASSETS_UTILITY}
          </MenuItem>
        ) : null}
        <MenuItem onClick={handleAddManually}>{locales.ADD_MANUALLY}</MenuItem>
        <MenuItem onClick={handleAddWithWalletConnect}>
          {locales.ADD_WITH_WALLET_CONNECT}
        </MenuItem>
      </Menu>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>{locales.ADD_A_CURRENCY}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {locales.SELECT_CRYPTO_ENTER_ITS_ADDRESS}
          </DialogContentText>
          <Block className={"new-resource-view"}>
            <Block className={"new-resource-item-view-edit-box"}>
              <Select
                classes={{
                  outlined: "new-resource-item-view-edit-box-asset-dropdown",
                }}
                inputProps={{ style: { width: "100%" } }}
                displayEmpty={true}
                value={newCurrencyAssetSymbol ?? ""}
                onChange={onSelectChange}
              >
                <MenuItem value={""}>
                  <Block
                    className={
                      "profile-form-form-preferred-asset-selector-dropdown-empty"
                    }
                  >
                    {locales.NONE}
                  </Block>
                </MenuItem>
                {availableAssets.map(
                  (asset: Asset): React.ReactElement => (
                    <MenuItem key={asset.symbol} value={asset.symbol}>
                      <CurrencyDropdownItem {...asset} />
                    </MenuItem>
                  ),
                )}
              </Select>
              <OutlinedInput
                inputProps={{
                  "data-testid": PROFILE_BLOCKCHAIN_ADDRESS_INPUT_TESTID,
                }}
                value={address ?? ""}
                classes={{ root: "new-resource-item-view-edit-box-address" }}
                onChange={onAddressChange}
              />
            </Block>
          </Block>
        </DialogContent>
        <DialogActions>
          <Button variant={"contained"} onClick={handleDialogClose}>
            {locales.CANCEL}
          </Button>
          <Button
            color={"primary"}
            disabled={!newCurrencyAssetSymbol || !address}
            variant={"contained"}
            onClick={handleAddCurrency}
          >
            {locales.ADD}
          </Button>
        </DialogActions>
      </Dialog>
      <CosmosAddUtility
        open={cosmosUtilityDialogOpen}
        onClose={() => setCosmosUtilityDialogOpen(false)}
        onAddResource={onAddResource}
        userResources={resources}
      />
    </>
  );
};
