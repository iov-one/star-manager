import { CertificateParser } from "@iov/certificate-parser";
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  InputAdornment,
  Link,
  OutlinedInput,
  Tooltip,
  Typography,
} from "@material-ui/core";
import {
  ErrorOutline,
  VerifiedUser,
  WarningOutlined,
} from "@material-ui/icons";
import { Button } from "@mui/material";
import { Block } from "components/block";
import React from "react";
import { NameItem } from "types/nameItem";

import { checkAccountMatch } from "../helper";

interface Props {
  certificate: CertificateParser | null;
  item: NameItem;
  showActions: boolean;
  b64Certificate?: string;
  displayElevated?: boolean;
  deleteCertificate?: (b64Certificate: string) => void;
}

interface CertificateFields {
  name: string;
  value: string;
}

const ViewCertificate = (props: Props): React.ReactElement => {
  const {
    certificate,
    displayElevated,
    item,
    deleteCertificate,
    b64Certificate,
    showActions,
  } = props;

  const getFieldsBasedOnType = (): CertificateFields | null => {
    if (certificate === null) return null;
    switch (certificate.getServiceType()) {
      case "web": {
        const webInfo = certificate.getWebsiteInfo();
        if (!webInfo) return null;
        return {
          name: "Domain",
          value: webInfo.host,
        };
      }
      case "twitter": {
        const twitterInfo = certificate.getTwitterClaimInfo();
        if (!twitterInfo) return null;
        return {
          name: "Handle",
          value: twitterInfo.handle,
        };
      }
      case "instagram": {
        const instagramInfo = certificate.getInstagramClaimInfo();
        if (!instagramInfo) return null;
        return {
          name: "Handle",
          value: instagramInfo.handle,
        };
      }
    }
  };

  const fieldNameValue = getFieldsBasedOnType();

  return (
    <Card
      className={"card-body"}
      variant={
        displayElevated !== undefined && displayElevated
          ? "elevation"
          : "outlined"
      }
    >
      <CardHeader
        title={
          certificate
            ? certificate.getCertifier().id
            : "Unsupported Certificate"
        }
        subheader={
          <Block className="card-subheader">
            {certificate ? (
              <Link
                underline={"none"}
                href={certificate.getCertifier().url}
                target="_blank"
              >
                {certificate.getCertifier().url}
              </Link>
            ) : (
              "- NA -"
            )}
          </Block>
        }
        action={
          certificate ? (
            certificate.checkIntegrity() &&
            checkAccountMatch(item, certificate) ? (
              <Tooltip title={"Valid certificate"}>
                <IconButton>
                  <VerifiedUser htmlColor="#4caf50" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title={"Invalid certificate"}>
                <IconButton>
                  <ErrorOutline htmlColor="#f44336" />
                </IconButton>
              </Tooltip>
            )
          ) : (
            <Tooltip title={"Unsupported certificate"}>
              <IconButton>
                <WarningOutlined htmlColor="#f49b36" />
              </IconButton>
            </Tooltip>
          )
        }
      />
      <CardContent className="card-content-body">
        {certificate === null && (
          <Block>
            <Typography variant="body2" gutterBottom>
              {`This looks like an external certificate, starname application
              doesn't support such certificates`}
            </Typography>
          </Block>
        )}
        {certificate && (
          <Block className={"view-fields-container"}>
            <OutlinedInput
              fullWidth
              readOnly={true}
              startAdornment={
                <InputAdornment position="start">Type</InputAdornment>
              }
              value={certificate.getServiceType()}
            />
            {fieldNameValue !== null && (
              <OutlinedInput
                fullWidth
                readOnly={true}
                startAdornment={
                  <InputAdornment position="start">
                    {fieldNameValue.name}
                  </InputAdornment>
                }
                value={fieldNameValue.value}
              />
            )}
          </Block>
        )}
      </CardContent>
      {showActions && (
        <CardActions>
          {deleteCertificate !== undefined ? (
            certificate !== null ? (
              <Button
                color="error"
                size="small"
                onClick={() =>
                  deleteCertificate(
                    Buffer.from(certificate.getRawCertificate()).toString(
                      "base64",
                    ),
                  )
                }
              >
                Delete certificate
              </Button>
            ) : b64Certificate ? (
              <Button
                color="error"
                size="small"
                onClick={() => deleteCertificate(b64Certificate)}
              >
                Delete certificate
              </Button>
            ) : null
          ) : null}
        </CardActions>
      )}
    </Card>
  );
};

export default ViewCertificate;
