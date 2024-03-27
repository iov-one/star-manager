import "./styles.scss";

import { Button, Typography } from "@material-ui/core";
import arrowLeft from "assets/arrow-left.svg";
import arrowRight from "assets/arrow-right.svg";
import { Block } from "components/block";
import locales from "locales/strings";
import React from "react";
import { Pager } from "types/pager";

interface Props {
  readonly pager: Pager;
}

export const TxTablePager: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { pager } = props;
  return (
    <Block className={"transactions-table-pager"}>
      <Typography variant={"subtitle2"}>
        {locales.ROWS_PER_PAGE} (
        {pager.size === Number.MAX_SAFE_INTEGER ? "\u221E" : pager.size})
      </Typography>
      <Button
        className={"transactions-table-pager-button"}
        onClick={pager.previous}
        disabled={pager.isFirst}
      >
        <img src={arrowLeft} alt={"previous page"} />
      </Button>
      <Typography variant={"subtitle2"}>{pager.number}</Typography>
      <Button
        className={"transactions-table-pager-button"}
        onClick={pager.next}
        disabled={pager.isLast}
      >
        <img src={arrowRight} alt={"next page"} />
      </Button>
    </Block>
  );
};
