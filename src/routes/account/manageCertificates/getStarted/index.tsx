import "./style.scss";

import { CloudUpload, Link } from "@material-ui/icons";
import { LoadingButton } from "@mui/lab";
import { Button } from "@mui/material";
import { Block } from "components/block";
import strings from "locales/strings";
import React from "react";

interface Props {
  onLinkClick: () => void;
  onUploadClick: () => void;
  loading: boolean;
  dense?: boolean;
}

const GetStarted = (props: Props): React.ReactElement => {
  return (
    <Block className={"get-started-container"}>
      <LoadingButton
        startIcon={<Link />}
        loadingPosition={"start"}
        loading={props.loading}
        variant={"contained"}
        color={"primary"}
        size={props.dense ? "medium" : "large"}
        onClick={props.onLinkClick}
      >
        {strings.LINK_CERTIFICATE}
      </LoadingButton>
      <Button
        startIcon={<CloudUpload />}
        variant={"outlined"}
        size={props.dense ? "medium" : "large"}
        onClick={props.onUploadClick}
      >
        {strings.UPLOAD_CERTIFICATE}
      </Button>
    </Block>
  );
};

export default GetStarted;
