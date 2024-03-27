import "./styles.scss";

import { Asset } from "@iov/asset-directory";
import { Button, Chip, Paper, TextField, Typography } from "@material-ui/core";
import DefaultUserImage from "assets/userDefault.svg";
import { LoadingItem } from "components/ApplicationBar/components/Menu/loadingItem";
import { Block } from "components/block";
import { SocialHandleEdit } from "components/socialHandleEdit";
import { Spinner } from "components/Spinner";
import toast, { ToastType } from "components/toast";
import TransactionDetails from "components/TransactionDetails";
import { useWallet } from "contexts/walletContext";
import {
  AccountOperation,
  OperationRouteProps,
  useAccountOperation,
} from "hooks/useAccountOperation";
import { ImageLoader, useImageLoader } from "hooks/useImageLoader";
import locales, { templateToString } from "locales/strings";
import { Task } from "logic/httpClient";
import { ProfileStore } from "mobx/stores/profileStore";
import { SessionStore, SessionStoreContext } from "mobx/stores/sessionStore";
import {
  SocialHandleContext,
  SocialHandleStore,
} from "mobx/stores/socialHandleStore";
import { observer } from "mobx-react";
import { SnackbarKey, useSnackbar } from "notistack";
import React from "react";
import { withRouter } from "react-router-dom";
import { SocialNetworks, SocialNetworkSpec } from "routes/account/edit/data";
import { SignerType } from "signers/signerType";
import { Wallet } from "signers/wallet";
import { toClassName } from "styles/toClassName";
import { Amount } from "types/amount";
import { NameItem } from "types/nameItem";
import { OperationType } from "types/operationType";
import { Profile } from "types/profile";
import { Resource, ResourceInfo } from "types/resourceInfo";
import { SocialHandleType } from "types/socialHandleType";
import { SocialHandleVerification } from "types/socialHandleVerification";
import checkIfPrivileged from "utils/checkPrivilegedScoreChainUser";
import { handleTxError } from "utils/handleTxError";

import ResourceAssetView from "./components/ResourceAssetView";
export const EditProfile: React.FC<OperationRouteProps> = observer(
  (props: OperationRouteProps): React.ReactElement => {
    const wallet = useWallet();

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const image: ImageLoader = useImageLoader(DefaultUserImage);
    const isViewOnly: boolean = wallet.getSignerType() === SignerType.ViewOnly;
    const sessionStore = React.useContext<SessionStore>(SessionStoreContext);
    const store = React.useRef<ProfileStore>(new ProfileStore()).current;
    const hiddenFileInput = React.useRef<HTMLInputElement>(null);
    const { history } = props;
    const operation: AccountOperation<void> = useAccountOperation<void>(props);
    const item: NameItem = operation.item;
    const price: Amount = React.useMemo<Amount>(
      (): Amount => item.getOperationPrice(OperationType.SetMetadata),
      [item],
    );
    const updateComponent = React.useRef<HTMLElement>(null);
    const { photo } = store;
    const loading: boolean = store.loading;
    const forceDisabled = !image.loaded || loading;
    const resources: ReadonlyArray<ResourceInfo> = store.resources;
    const availableAssets: ReadonlyArray<Asset> = store.availableAssets;
    const starname: string = React.useMemo(
      (): string => item.toString(),
      [item],
    );

    const hasBtcResource = !!resources.find(
      (_res) => _res.asset.symbol.toLowerCase() === "btc",
    );

    const [starAddress, setStarAddress] = React.useState<string>("");
    const [isPrivileged, setIsPrivileged] = React.useState<boolean>(false);
    const [checking, setChecking] = React.useState<boolean>(false);

    React.useLayoutEffect(() => {
      wallet.getAddress().then(setStarAddress);
    }, []);

    React.useEffect((): void => {
      if (photo === null) {
        image.replace(undefined);
      } else {
        image.replace(photo);
      }
    }, [image, photo]);

    React.useEffect((): (() => void) => {
      const { wallet } = operation;
      const task: Task<void> = store.load(wallet, item);
      task.run().catch(console.warn);
      return (): void => {
        task.abort();
      };
    }, [operation, store, item]);

    React.useEffect(() => {
      if (!starAddress || !hasBtcResource) return;
      setChecking(true);
      checkIfPrivileged(starAddress)
        .then(setIsPrivileged)
        .finally(() => setChecking(false));
    }, [starAddress, hasBtcResource]);

    React.useEffect(() => {
      if (isViewOnly || !store.canBeSubmitted || store.loading) return;
      const key = enqueueSnackbar(locales.PERFORM_UPDATE_TX, {
        variant: "info",
        persist: true,
        anchorOrigin: {
          horizontal: "right",
          vertical: "bottom",
        },
        action: (key: SnackbarKey) => {
          const handleAction = (): void => {
            if (updateComponent.current) {
              updateComponent.current.scrollIntoView(true);
            }
            closeSnackbar(key);
          };
          return (
            <Chip
              style={{ backgroundColor: "white" }}
              label={locales.UPDATE}
              onClick={handleAction}
              variant={"outlined"}
            />
          );
        },
      });

      return () => {
        closeSnackbar(key);
      };
    }, [
      closeSnackbar,
      enqueueSnackbar,
      isViewOnly,
      store.canBeSubmitted,
      store.loading,
    ]);

    const onFieldChange =
      (
        name: keyof Profile,
      ): ((
        event:
          | React.ChangeEvent<HTMLInputElement>
          | React.ChangeEvent<HTMLTextAreaElement>,
      ) => void) =>
      (
        event:
          | React.ChangeEvent<HTMLInputElement>
          | React.ChangeEvent<HTMLTextAreaElement>,
      ): void => {
        const { value } = event.target;
        store.setField(name, value);
      };

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      const { files } = event.target;
      if (files && files[0]) {
        store.setFile(files[0]);
      } else {
        store.setFile(null);
      }
    };

    const onCancel = (): void => {
      history.goBack();
    };

    const handleUploadImageClick = (): void => {
      if (hiddenFileInput.current !== null) {
        const { current } = hiddenFileInput;
        current.click();
      }
    };

    const handleRemovePhoto = (): void => {
      store.removeFile();
    };

    const handleSubmitForm = operation.createSubmitHandler(
      async (wallet: Wallet, item: NameItem): Promise<void> => {
        store.setLoading(true);
        store
          .submit(wallet, item)
          .then((): Promise<void> => {
            toast.show(locales.INFO_UPDATED_SUCCESS, ToastType.Success);
            // Refresh accounts of user now
            sessionStore.refreshAccounts();
            // Update the profile that we just modified
            const task = item.loadProfile();
            return task.run();
          })
          .catch(handleTxError)
          .then((): void => {
            sessionStore.onProfileUpdated(item);
            history.goBack();
          })
          .catch(handleTxError)
          .finally((): void => store.setLoading(false));
      },
    );

    const onUpdateSocialResource = React.useCallback(
      (
        type: SocialHandleType,
        verification: SocialHandleVerification,
        resource: Resource,
      ): void => {
        store.addSocialResource(type, verification, resource);
      },
      [store],
    );

    const onRemoveSocialResource = React.useCallback(
      (type: SocialHandleType): void => {
        store.removeSocialResource(type);
      },
      [store],
    );

    const onPreferredAssetChange = (value: string): void => {
      store.setPreferredAsset(value);
    };

    const addResourceWrapper = (symbol: string, address: string): void => {
      store.addResource(symbol, address);
    };

    const updateResourceWrapper = (
      resource: ResourceInfo,
      address: string,
    ): void => {
      store.updateResourceAddress(resource, address);
    };

    const removeResourceWrapper = (resource: ResourceInfo): void => {
      store.removeResource(resource);
    };

    const addWithWalletConnectWrapper = (): void => {
      store.addWithWalletConnect().catch(console.warn);
    };

    const signatureCount = store.getNumberOfNeededSignatures(operation.wallet);

    return (
      <>
        <Block className={"profile-form"}>
          <form className={"profile-form-form"}>
            <Block>
              <Paper
                classes={{ root: "profile-form-form-paper smaller" }}
                variant={"outlined"}
              >
                <Block className={"profile-form-form-picture"}>
                  <img
                    src={image.src}
                    alt={"user profile"}
                    onClick={
                      forceDisabled
                        ? (): void => undefined
                        : handleUploadImageClick
                    }
                  />
                  <div
                    className={toClassName(
                      "profile-form-form-picture-spinner",
                      {
                        loaded: image.loaded,
                      },
                    )}
                  >
                    <div />
                  </div>
                  <input
                    type={"file"}
                    onChange={onFileChange}
                    id="group_image"
                    ref={hiddenFileInput}
                    style={{ display: "none" }}
                  />
                </Block>
                <Block className={"profile-form-form-starname"}>
                  <Typography variant={"h5"}>{item.toString()}</Typography>
                </Block>
                <Block className={"profile-form-form-name-input-label"}>
                  <Typography variant={"h6"}>{locales.YOUR_NAME}</Typography>
                </Block>
                <TextField
                  autoFocus={true}
                  disabled={forceDisabled}
                  classes={{ root: "profile-form-form-name-input-root" }}
                  value={store.name}
                  placeholder={
                    !image.loaded ? locales.LOADING : locales.YOUR_NAME
                  }
                  onChange={onFieldChange("name")}
                />
                <Block className={"profile-form-form-picture-buttons"}>
                  <Button
                    disabled={forceDisabled}
                    className={
                      "profile-form-form-picture-add-remove-button add"
                    }
                    onClick={handleUploadImageClick}
                  >
                    {locales.PICK_PHOTO}
                  </Button>
                  <Button
                    disabled={forceDisabled}
                    className={
                      "profile-form-form-picture-add-remove-button remove"
                    }
                    onClick={handleRemovePhoto}
                  >
                    {locales.REMOVE_PHOTO}
                  </Button>
                </Block>
              </Paper>
              <Typography
                className={"profile-form-form-profile-details-section-title"}
                variant={"h5"}
              >
                {locales.SELECT_WHICH_CRYPTO_YOU_ACCEPT}
              </Typography>
              <Paper
                classes={{ root: "profile-form-form-paper" }}
                variant={"outlined"}
              >
                {hasBtcResource && checking ? (
                  <LoadingItem />
                ) : (
                  <ResourceAssetView
                    resources={resources}
                    availableAssets={availableAssets}
                    preferredAsset={store.preferredAsset}
                    onAddResource={addResourceWrapper}
                    onUpdateResource={updateResourceWrapper}
                    onRemoveResource={removeResourceWrapper}
                    onPreferredAssetChange={onPreferredAssetChange}
                    onAddWithWalletConnect={addWithWalletConnectWrapper}
                    isPrivileged={isPrivileged}
                    starAddress={starAddress}
                  />
                )}
              </Paper>
              <Paper
                variant={"outlined"}
                classes={{ root: "profile-form-form-paper" }}
              >
                <Typography
                  className={"profile-form-form-profile-details-section-title"}
                  variant={"h5"}
                >
                  {locales.DETAILS_ABOUT_YOUR_PROFILE}
                </Typography>
                <Block className={"profile-form-form-profile-details-field"}>
                  <Typography
                    className={"profile-form-form-profile-details-field-label"}
                    variant={"subtitle1"}
                  >
                    {locales.BIOGRAPHY}
                  </Typography>
                  <TextField
                    className={"profile-form-form-profile-details-field-input"}
                    disabled={forceDisabled}
                    multiline={true}
                    value={store.biography}
                    onChange={onFieldChange("biography")}
                  />
                </Block>
                <Block>
                  {SocialNetworks.map(
                    (spec: SocialNetworkSpec): React.ReactElement => {
                      return (
                        <SocialHandleContext.Provider
                          key={spec.type}
                          value={
                            new SocialHandleStore(
                              store.getSocialHandle(spec.type),
                            )
                          }
                        >
                          <SocialHandleEdit
                            starname={starname}
                            type={spec.type}
                            verifiable={spec.verifiable}
                            disabled={forceDisabled}
                            onUpdateResource={onUpdateSocialResource}
                            onRemoveResource={onRemoveSocialResource}
                          />
                        </SocialHandleContext.Provider>
                      );
                    },
                  )}
                </Block>
                {!isViewOnly ? (
                  <Block>
                    <Block>
                      <TransactionDetails
                        disabled={false}
                        amount={price}
                        fee={store.fee}
                      />
                    </Block>
                    {signatureCount > 1 ? (
                      <Block className={"profile-form-sign-notice"}>
                        <i className={"fa fa-info-circle"} />
                        <Typography variant={"body2"} align={"center"}>
                          {templateToString(
                            locales.NUMBER_OF_SIGNATURES_NOTICE,
                            {
                              count: signatureCount,
                            },
                          )}{" "}
                          {}
                        </Typography>
                      </Block>
                    ) : null}
                  </Block>
                ) : null}
                {!isViewOnly && store.canBeSubmitted ? (
                  <Typography
                    className={"profile-form-update-note"}
                    align={"center"}
                  >
                    {locales.UPDATE_ON_BLOCKCHAIN_NOTE}
                  </Typography>
                ) : null}
              </Paper>
              {!isViewOnly ? (
                <Block
                  className={"profile-form-button-box"}
                  ref={updateComponent}
                >
                  <Button
                    variant={"contained"}
                    color={"primary"}
                    className={"profile-form-button-box-button"}
                    disabled={!store.canBeSubmitted || forceDisabled}
                    onClick={handleSubmitForm}
                  >
                    {!loading ? locales.UPDATE : <Spinner size={24} />}
                  </Button>

                  <Button
                    className={"profile-form-button-box-button cancel"}
                    disabled={forceDisabled}
                    onClick={onCancel}
                  >
                    {locales.CANCEL}
                  </Button>
                </Block>
              ) : null}
            </Block>
          </form>
        </Block>
      </>
    );
  },
);

export default withRouter(EditProfile);
