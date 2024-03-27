import "./style.scss";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@material-ui/core";
import strings from "locales/strings";
import React from "react";

import GetStarted from "../getStarted";

interface Props {
  open: boolean;
  waiting: boolean;
  onClose: () => void;
  onLinkClick: () => void;
  onUploadClick: () => void;
}

const AddCertificateDialog = (props: Props): React.ReactElement => {
  const { onClose, open, onLinkClick, onUploadClick, waiting } = props;

  return (
    <Dialog fullWidth={true} open={open} onClose={onClose}>
      <DialogTitle>{strings.ADD_CERTIFICATE_DIALOG_TITLE}</DialogTitle>
      <DialogContent className="add-certificate-container">
        <Typography>
          You can now continue linking certificates to your starname or upload
          an existing certificate
        </Typography>
        <GetStarted
          loading={waiting}
          onLinkClick={onLinkClick}
          onUploadClick={onUploadClick}
          dense={true}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddCertificateDialog;
