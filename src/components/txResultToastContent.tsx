import config from "config";
import locales from "locales/strings";
import React from "react";

interface Props {
  readonly text: string;
  readonly txId: string;
}

export const TxResultToastContent: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { text, txId } = props;
  const href: string = React.useMemo(
    (): string => `${config.blockExplorerUrl.replace("{txHash}", txId)}`,
    [txId],
  );
  return (
    <div className={"tx-result-toast-content"}>
      <div className={"tx-result-toast-content-text"}>{text}</div>
      <a href={href} target={"_blank"} rel={"noopener noreferrer"}>
        {locales.VIEW_IN_BLOCK_EXPLORER}{" "}
        <i className={"fa fa-external-link-alt"} />
      </a>
    </div>
  );
};
