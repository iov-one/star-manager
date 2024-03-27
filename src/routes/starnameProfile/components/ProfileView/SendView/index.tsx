import React from "react";
import { ResolvedStarnameData } from "types/resolvedStarnameData";
import { StarnameProfilePage } from "types/starnameProfile";

import Avatar from "../../Avatar";
import BackButton from "../../BackButton";
import { Page, Pager } from "../Pager";
import { EnterAmountView } from "./enterAmountView";
import SendNftView from "./nftView";
import SendTokensView from "./sendTokensView";

interface Props {
  readonly type: "money" | "nft";
  readonly starnameData: ResolvedStarnameData;
  readonly starname: string;
  readonly loading: boolean;
  readonly page: StarnameProfilePage;
}

const SendView = (props: Props): React.ReactElement => {
  const {
    starnameData: { accountInfo },
    starname,
    page,
    type,
  } = props;
  return (
    <div className="send-view-container">
      <BackButton enabled={page === StarnameProfilePage.Send} />
      <div className={"avatar"}>
        <Avatar image={accountInfo ? accountInfo.photo : null} />
      </div>
      {type === "nft" ? (
        <SendNftView accountData={accountInfo} starname={starname} />
      ) : (
        // send money's own navigation
        <Pager currentPage={page}>
          <Page page={StarnameProfilePage.Main}>
            <EnterAmountView accountData={accountInfo} starname={starname} />
          </Page>
          <Page page={StarnameProfilePage.Send}>
            <SendTokensView accountData={accountInfo} starname={starname} />
          </Page>
        </Pager>
      )}
    </div>
  );
};

export default SendView;
