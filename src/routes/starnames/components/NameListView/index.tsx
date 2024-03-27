import "./style.scss";

import { Paper } from "@material-ui/core";
import { Block } from "components/block";
import locales from "locales/strings";
import React from "react";
import NameListHeadingItem from "routes/starnames/components/NameListHeadingItem";
import { NameItem } from "types/nameItem";
import { NameViewFilter } from "types/nameViewFilter";

import DomainView from "./DomainView";

interface Props {
  readonly items: ReadonlyArray<NameItem>;
  readonly filter: NameViewFilter;
}

const NamesListView: React.FC<Props> = (
  props: Props,
): React.ReactElement | null => {
  const { items = [] } = props;
  const premiumStarnamesMap = React.useMemo(() => {
    return items
      .filter((item) => item.isPremium())
      .sort((a, b) => (a.validUntil() < b.validUntil() ? 1 : -1))
      .reduce((namesMap, item) => {
        const domain = item.getDomainName();
        if (!(domain in namesMap)) {
          namesMap[domain] = [];
        }
        namesMap[domain].push(item);
        return namesMap;
      }, {} as { [domain: string]: Array<NameItem> });
  }, [items]);

  const basicStarnamesMap = React.useMemo(() => {
    return items
      .filter((item) => !item.isPremium())
      .sort((a, b) => (a.validUntil() < b.validUntil() ? 1 : -1))
      .reduce((namesMap, item) => {
        const domain = item.getDomainName();
        if (!(domain in namesMap)) {
          namesMap[domain] = [];
        }
        namesMap[domain].push(item);
        return namesMap;
      }, {} as { [domain: string]: Array<NameItem> });
  }, [items]);

  return (
    <Block className={"name-view-list"}>
      <NameListHeadingItem />
      {Object.keys(premiumStarnamesMap).length > 0 ? (
        <Block>
          <Block className={"name-view-list-premium-header"}>
            <Block className={"name-view-list-premium-header-text"}>
              <i className={"fas fa-star"}></i>
              {locales.PREMIUM.toUpperCase()}
            </Block>
          </Block>
          <Paper variant={"outlined"} className={"name-view-list-premium"}>
            {Object.keys(premiumStarnamesMap).map((domain) => (
              <DomainView key={domain} items={premiumStarnamesMap[domain]} />
            ))}
          </Paper>
        </Block>
      ) : null}

      {Object.keys(basicStarnamesMap).length > 0 ? (
        <Block>
          <Block className={"name-view-list-basic-header"}>
            <Block className={"name-view-list-basic-header-text"}>
              {locales.BASIC.toUpperCase()}
            </Block>
          </Block>
          <Paper variant={"outlined"} className={"name-view-list-basic"}>
            {Object.keys(basicStarnamesMap).map((domain) => (
              <DomainView key={domain} items={basicStarnamesMap[domain]} />
            ))}
          </Paper>
        </Block>
      ) : null}
    </Block>
  );
};

export default NamesListView;
