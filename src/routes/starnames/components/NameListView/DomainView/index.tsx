import { Block } from "components/block";
import React from "react";
import Entry from "routes/starnames/components/NameItemView";
import { isDomain } from "types/domain";
import { NameItem, OwnershipType } from "types/nameItem";

interface Props {
  items: ReadonlyArray<NameItem>;
}

const DomainView = (props: Props): React.ReactElement => {
  const { items } = props;
  const domainAccountIndex = items.findIndex(
    (item) => item.name === "" && item.getOwnership() === OwnershipType.Self,
  );
  // we only care about the domain for showing as header
  const escrowDomainItemIndex = items.findIndex(
    (item) =>
      item.getOwnership() === OwnershipType.Escrow && isDomain(item.getValue()),
  );
  const containsDomainOwnerItem = domainAccountIndex !== -1;
  const containsEscrowDomainItem = escrowDomainItemIndex !== -1;
  // we supply any item from items array as domainAccount (ex. if domain is *xyz we can supply a*xyz or b*xyz)
  // it doesn't matter as its domain part will just be used to show as listHeader
  const domainAccount = containsDomainOwnerItem
    ? items[domainAccountIndex]
    : items[0];
  // if containsEscrowDomainItem is false, only domain part of this item will be used
  // hence it can be any item of they array
  const escrowDomainAccount = containsEscrowDomainItem
    ? items[escrowDomainItemIndex]
    : items[0];
  const namesUnderDomain = [...items];
  if (containsDomainOwnerItem) {
    // remove domainAccount from allItems as we already have it under domainAccount
    namesUnderDomain.splice(domainAccountIndex, 1);
  }
  if (containsEscrowDomainItem) {
    namesUnderDomain.splice(escrowDomainItemIndex, 1);
  }
  namesUnderDomain.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Block>
      {/* This is a mock entry to show header if not domainOwner */}
      {/* else entry for domain default/main account */}

      {containsEscrowDomainItem ? (
        <Entry
          key={
            containsEscrowDomainItem
              ? escrowDomainAccount.toString()
              : escrowDomainAccount.domain
          }
          item={escrowDomainAccount}
          showAsListHeader={true}
          isActualItem={containsEscrowDomainItem}
        />
      ) : (
        <Entry
          key={
            containsDomainOwnerItem
              ? domainAccount.toString()
              : domainAccount.domain
          }
          item={domainAccount}
          showAsListHeader={!!domainAccount}
          isActualItem={containsDomainOwnerItem}
        />
      )}
      {namesUnderDomain.map((item) => (
        <Entry key={item.toString()} item={item} isActualItem={true} />
      ))}
    </Block>
  );
};

export default DomainView;
