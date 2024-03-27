import { message } from "antd";
import copyToClipboard from "clipboard-copy";
import React from "react";
import { AccountInfo } from "types/profile";

interface Props {
  readonly accountData: AccountInfo | null;
  readonly starname: string;
}

export const NameStarnameHeading: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { accountData, starname } = props;
  const [stubClass, setStubClass] = React.useState<string>("stub");

  React.useEffect(() => {
    if (accountData && accountData.name) {
      setStubClass("");
    }
  }, [accountData]);
  return (
    <>
      <h2 className={stubClass}>{accountData ? accountData.name : ""}</h2>
      <div
        className={"starname"}
        onClick={(): void => {
          copyToClipboard(starname)
            .then((): void => {
              message.success("Copied to clipboard!");
            })
            .catch((): void => {
              message.error("Sorry, could not copy");
            });
        }}
      >
        {starname !== "" ? (
          <>
            <span>{starname}</span>
          </>
        ) : null}
      </div>
    </>
  );
};
