import sortDown from "assets/sort-down.svg";
import sortDownActive from "assets/sort-down-active.svg";
import sortUp from "assets/sort-up.svg";
import sortUpActive from "assets/sort-up-active.svg";
import { Block } from "components/block";
import React from "react";
import {
  SortingStateProps,
  SortOrder,
} from "routes/transactions/components/sorting";
import TxColumn from "routes/transactions/components/TxTable/TxTableHeader/utils/txColumn";

interface Props {
  onSort: (name: string, order: SortOrder) => void;
  name: string;
}

class TxSortableColumn extends React.Component<
  React.PropsWithChildren<Props>,
  SortingStateProps
> {
  public state: SortingStateProps = {
    order: SortOrder.None,
  };

  public componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<SortingStateProps>,
  ): void {
    const { props, state } = this;
    if (state.order !== prevState.order) {
      props.onSort(props.name, state.order);
    }
  }

  private setSortOrder = (order: SortOrder): void => {
    this.setState({ order });
  };

  private onSort = (): void => {
    const { state } = this;
    if (state.order === SortOrder.None) {
      this.setSortOrder(SortOrder.Ascending);
    } else if (state.order === SortOrder.Ascending) {
      this.setSortOrder(SortOrder.Descending);
    } else {
      this.setSortOrder(SortOrder.None);
    }
  };

  public render(): React.ReactElement {
    const { props, state } = this;
    return (
      <TxColumn>
        <Block display={"flex"}>
          <Block
            display={"flex"}
            flexDirection={"column"}
            marginRight={8}
            cursor={"pointer"}
            onClick={this.onSort}
          >
            <img
              src={state.order === SortOrder.Descending ? sortUpActive : sortUp}
              alt={"descending sort"}
            />
            <Block margin={4} />
            <img
              src={
                state.order === SortOrder.Ascending ? sortDownActive : sortDown
              }
              alt={"ascending sort"}
            />
          </Block>
          <Block flex={1}>{props.children}</Block>
        </Block>
      </TxColumn>
    );
  }
}

export default TxSortableColumn;
