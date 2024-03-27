import "./styles.scss";

import { Block } from "components/block";
import { LoadingView } from "components/LoadingView";
import { SessionStore, SessionStoreContext } from "mobx/stores/sessionStore";
import { observer } from "mobx-react";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import EmptyView from "routes/starnames/components/emptyView";
import NamesListView from "routes/starnames/components/NameListView";
import { NameViewFilter } from "types/nameViewFilter";

interface Props extends RouteComponentProps<{ filter: NameViewFilter }> {}

const GenericNameView: React.FC<Props> = observer(
  (props: Props): React.ReactElement | null => {
    const { match } = props;
    const { filter = NameViewFilter.All } = match.params;
    const sessionStore = React.useContext<SessionStore>(SessionStoreContext);
    const { accounts: items } = sessionStore;

    const isEmpty = React.useMemo((): boolean => items.length === 0, [items]);

    if (sessionStore.loading) {
      return <LoadingView />;
    } else if (isEmpty) {
      // The empty view is fairly common in almost everything
      return (
        <Block className={"generic-name-view"}>
          <EmptyView />
        </Block>
      );
    } else {
      return (
        <Block className={"generic-name-view"}>
          <NamesListView filter={filter} items={items} />
        </Block>
      );
    }
  },
);

export default withRouter(GenericNameView);
