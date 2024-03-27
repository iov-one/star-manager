import config from "config";
import { LocationDescriptor } from "history";
import strings from "locales/strings";
import React from "react";
import { MANAGER_BASE_ROUTE } from "routes/paths";
import { ItemRouteState, NameItem, OwnershipType } from "types/nameItem";
import { NameType } from "types/nameType";

export interface Action {
  readonly key: string;
  readonly label: (item: NameItem) => string | React.ReactElement;
  readonly isAvailable: (item: NameItem) => boolean;
  readonly location?: (item: NameItem) => LocationDescriptor<ItemRouteState>;
  readonly redirectUrl?: (item: NameItem) => string;
  readonly icon: string;
}

export const actions: ReadonlyArray<Action> = [
  {
    key: "view",
    label: () => strings.VIEW_PROFILE,
    isAvailable: () => true,
    redirectUrl: (item) => `${config.managerUrl}/profile/${item.toString()}`,
    icon: "eye",
  },
  {
    key: "edit",
    label: () => strings.EDIT_PROFILE,
    isAvailable: (item) => item.getOwnership() < OwnershipType.Admin,
    location: (item: NameItem): LocationDescriptor<ItemRouteState> =>
      item.editProfileUrl(),
    icon: "pen-alt",
  },
  {
    key: "register",
    label: (item: NameItem) => (
      <div>
        <span>{strings.REGISTER_A}</span>
        <strong> *{item.domain} </strong>
        <span>{strings.STARNAME}</span>
      </div>
    ),
    isAvailable: (item: NameItem) =>
      item.type === NameType.Domain &&
      item.getOwnership() === OwnershipType.Self,
    location: (item: NameItem): LocationDescriptor<ItemRouteState> =>
      `${MANAGER_BASE_ROUTE}/register/${item.domain}`,
    icon: "star-of-life",
  },
  {
    key: "renew",
    label: () => strings.RENEW,
    isAvailable: (item: NameItem) => item.isRenewable(),
    location: (item: NameItem): LocationDescriptor<ItemRouteState> =>
      item.renewUrl(),
    icon: "clock",
  },
  {
    key: "transfer",
    label: () => strings.TRANSFER,
    isAvailable: (item) =>
      item.getOwnership() === OwnershipType.Self ||
      item.getOwnership() === OwnershipType.Admin,
    location: (item: NameItem): LocationDescriptor<ItemRouteState> =>
      item.transferUrl(),
    icon: "random",
  },
  {
    key: "delete",
    label: () => strings.DELETE,
    isAvailable: (item) => item.isDeletable(),
    location: (item: NameItem): LocationDescriptor<ItemRouteState> =>
      item.deleteUrl(),
    icon: "trash-alt",
  },
  {
    key: "manage-certificates",
    label: () => strings.MANAGE_CERTIFICATES,
    isAvailable: (item) => item.getOwnership() < OwnershipType.Admin,
    location: (item) => item.manageCertificatesUrl(),
    icon: "id-card",
  },
  {
    key: "showqr",
    label: () => strings.SHOW_QR,
    isAvailable: (item) => item.getOwnership() === OwnershipType.Self,
    location: (item) => item.showQRUrl(),
    icon: "qrcode",
  },
  {
    key: "sell-starname",
    label: () => "Sell starname",
    isAvailable: (item) => item.isTradable(),
    location: (item) => item.sellStarnameUrl(),
    icon: "tag",
  },
];
