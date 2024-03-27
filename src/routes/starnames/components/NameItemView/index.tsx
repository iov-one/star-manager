import "./styles.scss";

import {
  Chip,
  createTheme,
  Menu,
  MenuItem,
  MuiThemeProvider,
  Typography,
} from "@material-ui/core";
import { Block } from "components/block";
import { useWallet } from "contexts/walletContext";
import { ERROR_HTML_COLOR } from "genericConstants";
import { LocationDescriptor } from "history";
import strings from "locales/strings";
import { SessionStoreContext } from "mobx/stores/sessionStore";
import React from "react";
import { withRouter } from "react-router";
import { RouteComponentProps } from "react-router-dom";
import { ExpirationLabel } from "routes/starnames/components/expirationLabel";
import {
  Action,
  actions,
} from "routes/starnames/components/NameItemView/actions";
import { SignerType } from "signers/signerType";
import { ItemRouteState, NameItem, OwnershipType } from "types/nameItem";

import OwnershipChip from "./ownershipChip";
import themeOptions from "./theme";

interface OwnProps {
  readonly item: NameItem;
  readonly showAsListHeader?: boolean;
  readonly isActualItem?: boolean;
}

type Props = OwnProps & RouteComponentProps<never>;

const NameItemView: React.FC<Props> = (props: Props): React.ReactElement => {
  const { item, showAsListHeader, isActualItem } = props;
  const wallet = useWallet();
  const store = React.useContext(SessionStoreContext);
  const [isMenuOpen, setMenuOpen] = React.useState<boolean>(false);
  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(null);
  const navigateTo = (location: LocationDescriptor<ItemRouteState>): void => {
    props.history.push(location);
  };
  const toggleMenu = (): void => setMenuOpen(!isMenuOpen);

  const handleClickAction = (action: Action, item: NameItem): void => {
    if (action.location) return navigateTo(action.location(item));
    if (action.redirectUrl) {
      window.open(action.redirectUrl(item), "_blank");
      toggleMenu();
      return;
    }
    return;
  };

  const displayItemWithChips = (
    item: NameItem,
    displayAsAccount: boolean,
    mockForHeader = false,
  ): React.ReactNode => {
    return (
      <React.Fragment>
        {displayAsAccount ? (
          <Block className={"name-title"}>
            {item.name}
            <span>*{item.domain}</span>
          </Block>
        ) : (
          <Typography variant={"h4"}>
            {mockForHeader ? `*${item.domain}` : item.toString()}
          </Typography>
        )}
        {!displayAsAccount &&
          item.isPremium() &&
          item.getDomain().type === "open" && (
            <Chip
              color="primary"
              variant="outlined"
              size="small"
              label="Open"
            />
          )}
        {!mockForHeader &&
          (item.getOwnership() === OwnershipType.Escrow &&
          item.deadline(store.escrows) < Date.now() ? (
            <Chip
              style={{
                borderColor: ERROR_HTML_COLOR,
                color: ERROR_HTML_COLOR,
              }}
              variant="outlined"
              size="small"
              label={strings.ESCROW_EXPIRED}
            />
          ) : (
            <OwnershipChip ownership={item.getOwnership()} />
          ))}
      </React.Fragment>
    );
  };

  return (
    <>
      <Block
        className={
          showAsListHeader
            ? ["name-item-view-content", "domain-view"].join(" ")
            : ["name-item-view-content", "names-under-domain-view"].join(" ")
        }
      >
        <Block className={"name-item-view-heading"}>
          <Block className={"name-item-view-heading-title"}>
            {showAsListHeader
              ? isActualItem
                ? // this means the current (item) is surely an actual domainAccount item
                  displayItemWithChips(item, false)
                : // this means the item is actually an accountItem but we are mocking this item as a domain to showcase header
                  // so just use item.domain of this item
                  displayItemWithChips(item, false, true)
              : // now these are actual accounts
                displayItemWithChips(item, true)}
          </Block>

          {window.innerWidth >= 880 && isActualItem ? (
            <ExpirationLabel item={item} escrows={store.escrows} />
          ) : null}
        </Block>
        {showAsListHeader && !isActualItem ? null : (
          <Block className={"name-item-view-content-actions"}>
            <Block
              className={"name-item-view-content-actions-button"}
              onClick={toggleMenu}
              ref={setMenuAnchor}
            >
              <Typography>{strings.ACTIONS}</Typography>
              <i className={"fa fa-angle-down"} />
            </Block>
            <MuiThemeProvider theme={createTheme(themeOptions)}>
              <Menu
                open={isMenuOpen}
                anchorEl={menuAnchor}
                onClose={toggleMenu}
              >
                {actions
                  .filter((action: Action): boolean => action.isAvailable(item))
                  .map(
                    (action: Action): React.ReactElement => (
                      <MenuItem
                        key={action.key}
                        className={"name-item-view-menu-item"}
                        disabled={
                          action.key === "sell-starname" &&
                          wallet.getSignerType() === SignerType.Ledger
                        }
                        onClick={(): void => handleClickAction(action, item)}
                      >
                        <i className={`fa fa-${action.icon}`} />
                        {action.key === "sell-starname"
                          ? wallet.getSignerType() === SignerType.Ledger
                            ? "Sell starname (ledger not supported yet)"
                            : item.getOwnership() === OwnershipType.Escrow
                            ? Date.now() > item.deadline(store.escrows)
                              ? strings.REMOVE_ESCROW
                              : strings.MODIFY_ESCROW
                            : action.label(item)
                          : action.label(item)}
                      </MenuItem>
                    ),
                  )}
              </Menu>
            </MuiThemeProvider>
          </Block>
        )}
      </Block>
      {window.innerWidth < 880 && isActualItem ? (
        <ExpirationLabel item={item} escrows={store.escrows} />
      ) : null}
    </>
  );
};

export default withRouter(NameItemView);
