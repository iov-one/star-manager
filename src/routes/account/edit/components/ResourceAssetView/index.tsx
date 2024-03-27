import "./style.scss";

import { Asset } from "@iov/asset-directory";
import {
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  makeStyles,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
} from "@material-ui/core";
import { Speed } from "@material-ui/icons";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import FavoriteIcon from "@material-ui/icons/Favorite";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import MoreVert from "@material-ui/icons/MoreVert";
import { Block } from "components/block";
import { ERROR_HTML_COLOR } from "genericConstants";
import locales from "locales/strings";
import React from "react";
import theme from "theme";
import { ResourceInfo } from "types/resourceInfo";

import { AddResourceButton } from "./AddResource";
import ScoreChainModal from "./ScoreChainModal";

interface Props {
  onAddResource: (symbol: string, address: string) => void;
  onUpdateResource: (resource: ResourceInfo, address: string) => void;
  onRemoveResource: (resource: ResourceInfo) => void;
  onPreferredAssetChange: (value: string) => void;
  onAddWithWalletConnect: () => void;
  resources: ReadonlyArray<ResourceInfo>;
  availableAssets: ReadonlyArray<Asset>;
  preferredAsset: string;
  starAddress: string;
  isPrivileged?: boolean;
}

const useStyles = makeStyles({
  chip: {
    margin: theme.spacing(0.5),
    width: theme.spacing(15),
    justifyContent: "space-between",
  },
  favoriteAsset: {
    border: "2px solid",
    borderColor: "#5b72b7",
  },
  contentText: {
    marginTop: "-3%",
  },
});

const ResourceAssetView = (props: Props): React.ReactElement => {
  const styles = useStyles();
  const {
    resources,
    availableAssets,
    preferredAsset,
    isPrivileged,
    starAddress,
    onAddResource,
    onAddWithWalletConnect,
    onRemoveResource,
    onPreferredAssetChange,
    onUpdateResource,
  } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedAssetResource, setSelectedAssetResource] =
    React.useState<ResourceInfo | null>(null);
  const [editingAssetResource, setEditingAssetResource] =
    React.useState<boolean>(false);
  const [selectedAssetResourceAddress, setSelectedAssetResourceAddress] =
    React.useState<string>("");
  const [showGenerateScoreModal, setShowGenerateScoreModal] =
    React.useState<boolean>(false);

  const handleAssetOptionsClick = (
    event: React.MouseEvent<HTMLElement>,
    resource: ResourceInfo,
  ): void => {
    setAnchorEl(event.currentTarget);
    setSelectedAssetResource(resource);
  };

  const handleAssetEdit = (): void => {
    setAnchorEl(null);
    setEditingAssetResource(true);
  };

  const handleAssetRemove = (): void => {
    if (selectedAssetResource) {
      onRemoveResource(selectedAssetResource);
    }
    setAnchorEl(null);
  };

  const handleSetFavoriteAsset = (): void => {
    if (selectedAssetResource) {
      const { asset } = selectedAssetResource;
      if (preferredAsset === asset["starname-uri"]) onPreferredAssetChange("");
      else onPreferredAssetChange(asset["starname-uri"]);
    }
    setAnchorEl(null);
  };

  const handleAssetResourceAddressSave = (): void => {
    if (selectedAssetResource) {
      onUpdateResource(selectedAssetResource, selectedAssetResourceAddress);
    }
    setEditingAssetResource(false);
  };

  const handleDialogClose = (): void => {
    if (selectedAssetResource) {
      setSelectedAssetResourceAddress(selectedAssetResource.address);
    }
    setEditingAssetResource(false);
  };

  const handleGenerateScoreClick = (): void => {
    setAnchorEl(null);
    setShowGenerateScoreModal(true);
  };

  // Give priority of to provided coins array then sort based on name
  const sortedResources = React.useMemo(() => {
    return [...resources].sort((a, b) => {
      const {
        asset: { name: aName, symbol: aSymbol },
      } = a;
      const {
        asset: { name: bName, symbol: bSymbol },
      } = b;
      const priority = ["IOV", "BTC", "ETH", "ATOM"];
      if (priority.includes(aSymbol) && !priority.includes(bSymbol)) return -1;
      if (priority.includes(bSymbol) && !priority.includes(aSymbol)) return 1;
      if (priority.includes(aSymbol) && priority.includes(bSymbol))
        return priority.indexOf(aSymbol) - priority.indexOf(bSymbol);
      return aName.localeCompare(bName);
    });
  }, [resources]);

  React.useEffect(() => {
    if (!selectedAssetResource) return;
    setSelectedAssetResourceAddress(selectedAssetResource.address);
  }, [selectedAssetResource]);

  return (
    <Block className={"asset-chips-container"}>
      {sortedResources.map(
        (resource: ResourceInfo): React.ReactElement => (
          <Tooltip key={resource.asset.symbol} title={resource.asset.name}>
            <Chip
              key={resource.asset.symbol}
              className={[
                styles.chip,
                resource.asset["starname-uri"] === preferredAsset
                  ? styles.favoriteAsset
                  : "",
              ].join(" ")}
              variant={"outlined"}
              label={resource.asset.symbol}
              deleteIcon={<MoreVert />}
              // this is actually onClick thing for MoreVertIcon
              onDelete={(event: React.MouseEvent<HTMLElement>) =>
                handleAssetOptionsClick(event, resource)
              }
              avatar={
                <Avatar alt={resource.asset.name} src={resource.asset.logo} />
              }
            />
          </Tooltip>
        ),
      )}
      <AddResourceButton
        resources={resources}
        availableAssets={availableAssets}
        onAddResource={onAddResource}
        onAddWithWalletConnect={onAddWithWalletConnect}
      />
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={handleAssetEdit}>
          <Tooltip
            title={locales.EDIT_ASSET_NOTE}
            arrow={true}
            placement={"right-start"}
          >
            <EditIcon color={"primary"} />
          </Tooltip>
        </MenuItem>
        <MenuItem onClick={handleSetFavoriteAsset}>
          {selectedAssetResource?.asset["starname-uri"] === preferredAsset ? (
            <Tooltip
              title={locales.UNFAVORITE_ASSET_NOTE}
              arrow={true}
              placement={"right"}
            >
              <FavoriteBorderIcon color={"error"} />
            </Tooltip>
          ) : (
            <Tooltip
              title={locales.FAVORITE_ASSET_NOTE}
              arrow={true}
              placement={"right"}
            >
              <FavoriteIcon color={"error"} />
            </Tooltip>
          )}
        </MenuItem>
        <MenuItem onClick={handleAssetRemove}>
          <Tooltip
            title={locales.REMOVE_ASSET_NOTE}
            arrow={true}
            placement={"right-end"}
          >
            <DeleteIcon htmlColor={ERROR_HTML_COLOR} />
          </Tooltip>
        </MenuItem>
        {isPrivileged !== undefined &&
        isPrivileged &&
        selectedAssetResource &&
        selectedAssetResource.asset.symbol === "BTC" ? (
          <MenuItem onClick={handleGenerateScoreClick}>
            <Tooltip
              title={locales.GENERATE_SCORE}
              arrow={true}
              placement={"right-end"}
            >
              <Speed htmlColor={"#8a5be1"} />
            </Tooltip>
          </MenuItem>
        ) : null}
      </Menu>
      <Dialog
        open={!!editingAssetResource}
        onClose={handleDialogClose}
        disableEnforceFocus
      >
        {selectedAssetResource ? (
          <>
            <DialogTitle>
              {locales.EDIT + " " + selectedAssetResource.asset.name}
            </DialogTitle>
            <DialogContent>
              <DialogContentText className={styles.contentText}>
                {locales.ENTER_BLOCKCHAIN_ADDRESS_FOR +
                  selectedAssetResource.asset.name}
              </DialogContentText>
              <TextField
                value={selectedAssetResourceAddress}
                onChange={(event) => {
                  setSelectedAssetResourceAddress(event.target.value);
                }}
                fullWidth={true}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>{locales.CANCEL}</Button>
              <Button
                variant={"contained"}
                color={"primary"}
                onClick={handleAssetResourceAddressSave}
              >
                {locales.SAVE}
              </Button>
            </DialogActions>
          </>
        ) : null}
      </Dialog>
      <ScoreChainModal
        starAddress={starAddress}
        btcAddress={selectedAssetResourceAddress}
        show={showGenerateScoreModal}
        onClose={() => setShowGenerateScoreModal(false)}
      />
    </Block>
  );
};

export default ResourceAssetView;
