import "./style.scss";

import { Loyalty, PersonAdd, Send } from "@material-ui/icons";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import SendIcon from "assets/hand.svg";
import StarnameProfileBottomNavContext from "contexts/profileBottomNavContext";
import strings from "locales/strings";
import React from "react";
import { useParams } from "react-router";
import { ResolvedStarnameData } from "types/resolvedStarnameData";
import { StarnameProfilePage } from "types/starnameProfile";
import { StarnameProfileScreen } from "types/starnameProfileScreen";

import BottomNavItem from "./BottomNavItem";
import OpenDomainProfileView from "./OpenDomainProfileView";
import SendView from "./SendView";
import StarnameSaleView from "./StarnameSaleView";

interface Props {
  readonly starnameData: ResolvedStarnameData;
  readonly starname: string;
  readonly loading: boolean;
  readonly page: StarnameProfilePage;
  readonly searchParams: URLSearchParams;
}

interface TabbedViewProps extends Props {
  readonly starnameData: ResolvedStarnameData;
}

export const ProfileTabbedView = (
  props: TabbedViewProps,
): React.ReactElement => {
  const { starnameData } = props;
  const params = useParams<{
    starname: string;
    currency?: string | undefined;
  }>();
  const [selected, setSelected] = React.useState<StarnameProfileScreen>(
    StarnameProfileScreen.SendMoney,
  );

  const isOpenDomain =
    starnameData.domainInfo && starnameData.domainInfo.type === "open";

  React.useEffect(() => {
    if (params.currency !== undefined) {
      if (params.currency === "nft") {
        setSelected(StarnameProfileScreen.SendNFT);
        return;
      }
      return;
    }
    if (starnameData.escrowInfo !== null && !isOpenDomain) {
      setSelected(StarnameProfileScreen.StarnameSale);
      return;
    }
    if (starnameData.domainInfo && starnameData.domainInfo.type === "open")
      setSelected(StarnameProfileScreen.RegisterAccount);
  }, [starnameData]);

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: StarnameProfileScreen,
  ): void => {
    setSelected(newValue);
  };

  return (
    <div className="profile-view higher-top-margin">
      <StarnameProfileBottomNavContext.Provider value={selected}>
        {isOpenDomain && starnameData.domainInfo && (
          <BottomNavItem value={StarnameProfileScreen.RegisterAccount}>
            <OpenDomainProfileView
              domainData={starnameData.domainInfo}
              accountData={starnameData.accountInfo}
            />
          </BottomNavItem>
        )}
        <BottomNavItem value={StarnameProfileScreen.SendMoney}>
          <SendView
            type="money"
            loading={props.loading}
            page={props.page}
            starname={props.starname}
            starnameData={starnameData}
          />
        </BottomNavItem>
        <BottomNavItem value={StarnameProfileScreen.SendNFT}>
          <SendView
            type="nft"
            loading={props.loading}
            page={props.page}
            starname={props.starname}
            starnameData={starnameData}
          />
        </BottomNavItem>
        {starnameData.escrowInfo !== null && !isOpenDomain && (
          <BottomNavItem value={StarnameProfileScreen.StarnameSale}>
            <StarnameSaleView
              starname={params.starname}
              escrow={starnameData.escrowInfo}
            />
          </BottomNavItem>
        )}
      </StarnameProfileBottomNavContext.Provider>
      <div className="bottom-navigation-container">
        <BottomNavigation
          sx={{
            borderTopRightRadius: "15px",
            borderTopLeftRadius: "15px",
            backdropFilter: "blur(20px)",
            background: "rgba(255,255,255,0.5)",
          }}
          value={selected}
          onChange={handleChange}
          showLabels
        >
          {isOpenDomain && (
            <BottomNavigationAction
              icon={<PersonAdd />}
              label={strings.REGISTER_ACCOUNT}
              value={StarnameProfileScreen.RegisterAccount}
            />
          )}

          <BottomNavigationAction
            icon={<img width={24} height={24} src={SendIcon} />}
            label={strings.SEND_MONEY}
            value={StarnameProfileScreen.SendMoney}
          />
          <BottomNavigationAction
            icon={<Send />}
            label={strings.SEND_NFT}
            value={StarnameProfileScreen.SendNFT}
          />
          {starnameData.escrowInfo !== null && !isOpenDomain && (
            <BottomNavigationAction
              icon={<Loyalty />}
              label={strings.FOR_SALE}
              value={StarnameProfileScreen.StarnameSale}
            />
          )}
        </BottomNavigation>
      </div>
    </div>
  );
};

export const ProfileView: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  return <ProfileTabbedView {...props} />;
};
