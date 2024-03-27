import "./style.scss";

import { CertificateParser } from "@iov/certificate-parser";
import {
  Backdrop,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  LinearProgress,
  Typography,
} from "@material-ui/core";
import { PostAdd } from "@material-ui/icons";
import { LoadingButton } from "@mui/lab";
import { Button } from "@mui/material";
import api from "api";
import { Block } from "components/block";
import toast, { ToastType } from "components/toast";
import { TxResultToastContent } from "components/txResultToastContent";
import config from "config";
import { useWallet } from "contexts/walletContext";
import { OperationRouteProps } from "hooks/useAccountOperation";
import { useTxPromiseHandler } from "hooks/useTxPromiseHandler";
import { CertificateGetStarted } from "locales/componentStrings";
import strings from "locales/strings";
import { SessionStoreContext } from "mobx/stores/sessionStore";
import { observer } from "mobx-react";
import React from "react";
import { withRouter } from "react-router";
import theme from "theme";
import { Name } from "types/name";
import { NameItem } from "types/nameItem";
import { handleTxError } from "utils/handleTxError";

import AddCertificateDialog from "./add";
import GetStarted from "./getStarted";
import { certificateFromData } from "./helper";
import ViewCertificate from "./view";

const ManageAccountCertificates = observer(
  (props: OperationRouteProps): React.ReactElement => {
    const { certifierAppUrl } = config;
    const wallet = useWallet();
    const [handler] = useTxPromiseHandler();
    const store = React.useContext(SessionStoreContext);
    const hiddenFileInput = React.useRef<HTMLInputElement>(null);
    const [item, setItem] = React.useState<NameItem>(props.location.state.item);
    const [file, setFile] = React.useState<File | null>(null);
    const [parsedCertificate, setParsedCertificate] =
      React.useState<CertificateParser | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [waiting, setWaiting] = React.useState<boolean>(false);
    const [addLoading, setAddLoading] = React.useState<boolean>(false);
    const [previewLoading, setPreviewLoading] = React.useState<boolean>(false);
    const [showPreview, setShowPreview] = React.useState<boolean>(false);
    const [showAddcertificateDialog, setShowAddCertificateDialog] =
      React.useState<boolean>(false);
    const settings = api.getSettings();
    const certificates = (item.getValue() as Name).certificates;

    React.useEffect(() => {
      if (store.accounts.length === 0) return;
      const latestItem = store.accounts.find(
        (_item) => _item.toString() === props.location.state.item.toString(),
      );
      if (latestItem) setItem(latestItem);
    }, [props.location.state.item, store.accounts]);

    const certifierUrl = React.useMemo(() => {
      const params = new URLSearchParams();
      params.set("starname", item.toString());
      params.set("address", item.getValue().owner);
      params.set("redirect_uri", window.location.origin);
      return `${certifierAppUrl}?${params.toString()}`;
    }, []);

    // provide certificate to parser
    React.useEffect(() => {
      if (file === null) return;
      setPreviewLoading(true);
      new Response(file)
        .json()
        .then(
          (json) => {
            try {
              setParsedCertificate(new CertificateParser(JSON.stringify(json)));
            } catch (error) {
              toast.show((error as Error).message, ToastType.Error);
            }
          },
          () => {
            toast.show("Not a valid JSON file", ToastType.Error);
          },
        )
        .finally(() => {
          setPreviewLoading(false);
          // reset fileinput value in order to use it again
          if (hiddenFileInput.current) hiddenFileInput.current.value = "";
        });
    }, [file]);

    const messageListener = (event: MessageEvent): void => {
      if (event.origin !== certifierAppUrl) return;
      if (event.data) {
        if ("certificate" in event.data) {
          if (event.source) {
            event.source.postMessage(
              { message: "action:close_certifier" },
              {
                targetOrigin: certifierAppUrl,
              },
            );
          }
          setWaiting(false);
          setShowPreview(true);
          setParsedCertificate(
            new CertificateParser(JSON.stringify(event.data.certificate)),
          );
        }
      }
    };
    // add listener for handling message posted from certifier
    React.useEffect(() => {
      window.addEventListener("message", messageListener);
      return () => {
        window.removeEventListener("message", messageListener);
      };
    }, []);

    const handleDelete = (b64Certificate: string): void => {
      if (b64Certificate.length === 0) return;
      setLoading(true);
      handler(
        wallet.deleteAccountCertificate(item.name, item.domain, b64Certificate),
      )
        .then((txId) => {
          toast.show(
            <TxResultToastContent
              txId={txId}
              text={strings.DELETE_CERTIFICATE_SUCCESS}
            />,
            ToastType.Success,
          );
          store.refreshAccounts();
        })
        .catch(handleTxError)
        .finally(() => {
          setLoading(false);
        });
    };

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      const { files } = event.target;
      if (files && files[0]) {
        setFile(files[0]);
        setShowPreview(true);
      } else {
        setFile(null);
      }
    };

    const handleLinkCertificateClick = (): void => {
      setWaiting(true);
      const popup = window.open(certifierUrl, "_blank");

      if (popup) {
        const timer = setInterval(() => {
          if (popup.closed !== false) {
            clearInterval(timer);
            setWaiting(false);
          }
        }, 300);
      }
    };

    const handleUploadCertificateClick = (): void => {
      if (hiddenFileInput.current !== null) {
        const { current } = hiddenFileInput;
        current.click();
      }
    };

    const handleAddCertificate = (): void => {
      if (!parsedCertificate) return;
      setAddLoading(true);
      handler(
        wallet.addAccountCertificate(
          item.name,
          item.domain,
          parsedCertificate.getRawCertificate(),
        ),
      )
        .then((txId) => {
          toast.show(
            <TxResultToastContent
              text={strings.ADD_CERTIFICATE_SUCCESS}
              txId={txId}
            />,
            ToastType.Success,
          );
          store.refreshAccounts();
          handlePreviewClose();
        })
        .catch(handleTxError)
        .finally(() => {
          setAddLoading(false);
        });
    };

    const handlePreviewClose = (): void => {
      setShowPreview(false);
      setFile(null);
      setParsedCertificate(null);
    };

    const checkPreviewCertificateErrors = (): ReadonlyArray<string> => {
      // return if not a preview cert
      if (!parsedCertificate) return [];
      const errors = Array<string>();
      if (!parsedCertificate.checkIntegrity())
        errors.push(strings.CERTIFICATE_ERROR_INVALID);
      if (parsedCertificate.getStarnameInfo().starname !== item.toString())
        errors.push(strings.CERTIFICATE_ERROR_ACCOUNT_MISMATCH);
      const parsedB64Cert = Buffer.from(
        parsedCertificate.getRawCertificate(),
      ).toString("base64");
      if (parsedB64Cert.length >= settings.certificateSizeMax)
        errors.push(strings.CERTIFICATE_MAX_LENGTH_EXCEED);
      if (certificates.includes(parsedB64Cert))
        errors.push(strings.CERTIFICATE_ERROR_ALREADY_EXISTS);
      return errors;
    };

    return (
      <Block className="certificates-block-container">
        <Block className="certificate-block-header-container">
          <input
            type={"file"}
            onChange={onFileChange}
            id="certificate_file"
            ref={hiddenFileInput}
            style={{ display: "none" }}
          />
          <Block className="certificate-block-actions-container">
            <Button
              color={"primary"}
              variant={"contained"}
              startIcon={<PostAdd />}
              disabled={
                certificates.length >= settings.certificateCountMax ||
                certificates.length === 0
              }
              onClick={() => setShowAddCertificateDialog(true)}
            >
              Add certificate
            </Button>
            <Button
              variant={"contained"}
              color={"inherit"}
              onClick={() => props.history.goBack()}
            >
              {strings.GO_BACK}
            </Button>
          </Block>
        </Block>
        {certificates.length > 0 ? (
          <Block className={"certificates-container"}>
            {certificates.map((b64Certificate, idx) => {
              const parsed = certificateFromData(b64Certificate, true);
              return (
                <Block className="certificate-view" key={`cert-${idx}`}>
                  <ViewCertificate
                    certificate={parsed}
                    b64Certificate={b64Certificate}
                    item={item}
                    showActions={true}
                    displayElevated={true}
                    deleteCertificate={handleDelete}
                  />
                </Block>
              );
            })}
          </Block>
        ) : (
          <Block className={"not-found-container"}>
            <Typography variant={"h4"} component={"h4"} gutterBottom>
              {CertificateGetStarted.INTRO}
            </Typography>
            <Typography variant={"body1"} gutterBottom>
              {CertificateGetStarted.PRIMARY}
            </Typography>
            <Typography variant={"body1"} gutterBottom>
              {CertificateGetStarted.SECONDARY}
            </Typography>
            <GetStarted
              loading={waiting}
              onLinkClick={handleLinkCertificateClick}
              onUploadClick={handleUploadCertificateClick}
            />
          </Block>
        )}
        <Dialog fullWidth open={showPreview} onClose={handlePreviewClose}>
          <DialogTitle>Certificate Preview</DialogTitle>
          <DialogContent>
            {previewLoading ? (
              <Block className={"preview-loading-container"}>
                <LinearProgress />
                <Typography className={"text"} align="center">
                  {strings.CERTIFICATE_PREVIEW_LOADING}
                </Typography>
              </Block>
            ) : (
              <Block>
                <ViewCertificate
                  certificate={parsedCertificate}
                  item={item}
                  showActions={false}
                />
                {parsedCertificate && (
                  <Block>
                    {checkPreviewCertificateErrors().map((err, idx) => (
                      <FormHelperText key={idx} error={true}>
                        {err}
                      </FormHelperText>
                    ))}
                  </Block>
                )}
              </Block>
            )}
          </DialogContent>
          <DialogActions>
            {parsedCertificate && (
              <LoadingButton
                loading={addLoading}
                loadingPosition={"center"}
                onClick={handleAddCertificate}
                disabled={checkPreviewCertificateErrors().length > 0}
              >
                {strings.ADD_TO_CHAIN}
              </LoadingButton>
            )}
            <Button onClick={handlePreviewClose}>{strings.GO_BACK}</Button>
          </DialogActions>
        </Dialog>
        <AddCertificateDialog
          open={showAddcertificateDialog}
          waiting={waiting}
          onClose={() => setShowAddCertificateDialog(false)}
          onLinkClick={handleLinkCertificateClick}
          onUploadClick={handleUploadCertificateClick}
        />
        <Backdrop
          style={{ zIndex: theme.zIndex.modal + 5, color: "#fff" }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Block>
    );
  },
);

export default withRouter(ManageAccountCertificates);
