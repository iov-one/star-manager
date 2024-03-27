import "./style.scss";

import { Asset } from "@iov/asset-directory";
import { Button, Typography } from "@material-ui/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import LoadingButton from "@mui/lab/LoadingButton";
import { Avatar, AvatarGroup, ButtonGroup } from "@mui/material";
import api from "api";
import starnameLogo from "assets/logo.webp";
import { Block } from "components/block";
import { LoadingView } from "components/LoadingView";
import config from "config";
import { saveAs } from "file-saver";
import { DOWNLOADABLE_QR_FILE_NAME } from "genericConstants";
import html2canvas from "html2canvas";
import locales from "locales/strings";
import React, { useRef } from "react";
import QRCode from "react-qr-code";
import { RouteComponentProps, useParams, withRouter } from "react-router";
import { STARNAME_PROFILE_BASE } from "routes/paths";
import { IMAGES } from "routes/starnameProfile/Assets";
import { resolveStarname } from "routes/starnameProfile/components/GetStarnameProfile/helper";
import { AccountInfo } from "types/profile";
import { ResolvedStarnameData } from "types/resolvedStarnameData";

import ProfileContainer from "./profileContainer";

const ShowQrCode = (props: RouteComponentProps): React.ReactElement => {
  const { name } = useParams<{ name: string }>();

  const [profile, setProfile] = React.useState<AccountInfo | undefined>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [canvasLoading, setCanvasLoading] = React.useState<boolean>(false);
  const containerRef = useRef<HTMLElement>(null);
  const buttonsContainerRef = useRef<HTMLElement>(null);
  const { history } = props;

  React.useEffect((): void => {
    resolveStarname(name)
      .then((response: ResolvedStarnameData): void => {
        setProfile(response.accountInfo ?? undefined);
      })
      .catch(console.error)
      .finally((): void => setLoading(false));
  }, [name]);

  const handleDownload = (): void => {
    setCanvasLoading(true);
    if (containerRef.current && buttonsContainerRef.current) {
      html2canvas(containerRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 2,
        ignoreElements: (el) => el === buttonsContainerRef.current,
      }).then((canvas) => {
        setCanvasLoading(false);
        saveAs(canvas.toDataURL(), DOWNLOADABLE_QR_FILE_NAME);
      });
    }
  };

  const showcaseAssets = (profile: AccountInfo): ReadonlyArray<Asset> => {
    const { resources } = profile;
    if (resources) {
      return resources
        .reduce((acc, resource) => {
          const asset = api.getAssetByUri(resource.uri);
          if (asset) {
            acc.push(asset);
          }
          return acc;
        }, Array<Asset>())
        .sort((a, b) => {
          const { name: aName, symbol: aSymbol } = a;
          const { name: bName, symbol: bSymbol } = b;
          const priority = ["BTC", "ETH", "ATOM", "BNB", "USDT", "SOL", "ADA"];
          if (priority.includes(aSymbol) && !priority.includes(bSymbol))
            return -1;
          if (priority.includes(bSymbol) && !priority.includes(aSymbol))
            return 1;
          if (priority.includes(aSymbol) && priority.includes(bSymbol))
            return priority.indexOf(aSymbol) - priority.indexOf(bSymbol);
          return aName.localeCompare(bName);
        });
    }
    return [];
  };

  return !loading && profile ? (
    <Block className={"container"} ref={containerRef}>
      <ProfileContainer
        icon={
          <img src={profile.photo ?? IMAGES.DEFAULT_IMAGE} alt="user avatar" />
        }
      >
        <img
          className={"starname-logo"}
          src={starnameLogo}
          alt={"starname logo"}
        />
        <Block className={"accepted-note"}>
          <Typography variant={"h6"} align={"center"}>
            {locales.CRYPTO_ACCEPTED}
          </Typography>
        </Block>
        <Block className={"user-starname"}>
          <Typography variant={"h6"}>{name}</Typography>
        </Block>
        <Block className={"to-pay-user-note"}>
          <Typography align={"center"}>
            {locales.SCAN_TO_PAY} {profile.name}
          </Typography>
        </Block>
        <Block className="qr-container">
          <QRCode
            value={config.managerUrl + STARNAME_PROFILE_BASE + `/${name}`}
            level={"M"}
          />
        </Block>
        <AvatarGroup className={"showcase-assets"} max={7} variant={"circular"}>
          {showcaseAssets(profile).map((asset) => (
            <Avatar alt={asset.name} src={asset.logo} key={asset.symbol} />
          ))}
        </AvatarGroup>
      </ProfileContainer>
      <Block className="buttons-container" ref={buttonsContainerRef}>
        <ButtonGroup>
          <Button onClick={() => history.goBack()} variant={"outlined"}>
            {locales.CANCEL}
          </Button>
          <LoadingButton
            loading={canvasLoading}
            loadingPosition="start"
            onClick={handleDownload}
            variant={"contained"}
            color={"primary"}
            startIcon={<GetAppIcon />}
            fullWidth
          >
            {locales.DOWNLOAD_QR}
          </LoadingButton>
        </ButtonGroup>
      </Block>
    </Block>
  ) : (
    <LoadingView />
  );
};

export default withRouter(ShowQrCode);
