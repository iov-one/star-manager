import { Asset } from "@iov/asset-directory";
import { CheckCircle } from "@material-ui/icons";
import QueueIcon from "@material-ui/icons/Queue";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import api from "api";
import { Block } from "components/block";
import {
  getChainSymbol,
  SUPPORTED_OTHER_WALLET_CHAINS,
} from "config/supportedChains";
import { useWallet } from "contexts/walletContext";
import { CosmosAssetAddUtilityLabels } from "locales/componentStrings";
import locales from "locales/strings";
import React from "react";
import { SignerType } from "signers/signerType";
import { ResourceInfo } from "types/resourceInfo";
import { WalletChainConfig } from "types/walletChains";

interface Props {
  readonly userResources: ReadonlyArray<ResourceInfo>;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onAddResource: (symbol: string, address: string) => void;
}

export enum AddCosmosAssetSteps {
  INTRODUCTION,
  SELECT_CURRENCIES,
  ADD_TO_PROFILE,
}

const CosmosAddUtilityStepper: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { userResources, open, onAddResource, onClose } = props;
  const [loading, setLoading] = React.useState<boolean>(false);
  const [addedToProfile, setAddedToProfile] = React.useState<boolean>(false);
  const [activeStep, setActiveStep] = React.useState(
    AddCosmosAssetSteps.INTRODUCTION,
  );
  const [selectedAssets, setSelectedAssets] =
    React.useState<ReadonlyArray<Asset> | null>(null);

  const wallet = useWallet();

  const getAddableAssets = React.useCallback((): ReadonlyArray<Asset> => {
    return SUPPORTED_OTHER_WALLET_CHAINS.filter(
      (chain) =>
        !userResources.find(
          (_res) => _res.asset.symbol.toUpperCase() === getChainSymbol(chain),
        ),
    ).reduce((acc, chain) => {
      const asset = api.getAssetByTicker(getChainSymbol(chain));
      if (asset) {
        acc.push(asset);
      }
      return acc;
    }, Array<Asset>());
  }, [userResources]);

  const resetSteps = (): void => {
    setSelectedAssets(null);
    setAddedToProfile(false);
    setActiveStep(AddCosmosAssetSteps.INTRODUCTION);
  };

  React.useEffect(() => {
    if (!open) return;
    if (!selectedAssets) setSelectedAssets(getAddableAssets());
  }, [getAddableAssets, open, selectedAssets]);

  const handleNext = (): void => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = (): void => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const hanldeAddableAssetsReset = (): void => {
    setSelectedAssets(getAddableAssets());
  };

  const handleClose = (): void => {
    onClose();
    resetSteps();
  };

  const handleAddToProfile = async (): Promise<void> => {
    if (!selectedAssets) return;
    setLoading(true);
    // these are required chains for permissions as per user selection
    const requiredChains = selectedAssets.reduce((acc, asset) => {
      const found = SUPPORTED_OTHER_WALLET_CHAINS.find(
        (chain) => getChainSymbol(chain) === asset.symbol.toUpperCase(),
      );
      if (found) acc.push(found);
      return acc;
    }, Array<WalletChainConfig>());
    const requiredOtherChainResources = await wallet.getOtherChainResources(
      requiredChains,
    );
    requiredOtherChainResources.forEach((chainResource) =>
      onAddResource(
        chainResource.uri.split(":")[1].toUpperCase(),
        chainResource.resource,
      ),
    );
    setLoading(false);
    setAddedToProfile(true);
    setTimeout(() => {
      onClose();
      resetSteps();
    }, 1500);
  };

  const getStepContent = (): React.ReactNode => {
    switch (activeStep) {
      case AddCosmosAssetSteps.INTRODUCTION:
        return (
          <>
            <Typography gutterBottom={true}>
              {locales.COSMOS_ASSETS_ADD_UTILITY_INTRO_PRIMARY}
            </Typography>
            <Typography variant={"subtitle2"} color={"inherit"}>
              {locales.COSMOS_ASSETS_ADD_UTILITY_INTRO_SECONDARY}
            </Typography>
          </>
        );
      case AddCosmosAssetSteps.SELECT_CURRENCIES:
        return (
          <Block>
            {selectedAssets ? (
              selectedAssets.length > 0 ? (
                selectedAssets.map((asset) => {
                  return (
                    <Chip
                      variant={"outlined"}
                      style={{ margin: "5px" }}
                      avatar={<Avatar src={asset.logo} />}
                      key={asset.symbol}
                      label={asset.symbol}
                      onDelete={() => {
                        setSelectedAssets(
                          selectedAssets.filter(
                            (_val) => _val.symbol !== asset.symbol,
                          ),
                        );
                      }}
                    />
                  );
                })
              ) : (
                <>
                  <Typography
                    variant={"subtitle2"}
                    color={"inherit"}
                    gutterBottom={true}
                  >
                    {locales.COSMOS_ASSETS_ADD_UTILITY_NOTHING_TO_ADD}
                  </Typography>
                  <Typography variant={"subtitle2"} color={"inherit"}>
                    {locales.KUDOS_TO_YOU}
                  </Typography>
                </>
              )
            ) : null}
          </Block>
        );
      case AddCosmosAssetSteps.ADD_TO_PROFILE: {
        const isKeplrSigner = wallet.getSignerType() === SignerType.Keplr;
        return (
          <Block>
            {isKeplrSigner && selectedAssets?.length ? (
              <Typography gutterBottom={true}>
                {locales.COSMOS_ASSETS_ADD_UTILITY_KEPLR_PERMISSIONS_NOTE}
              </Typography>
            ) : null}
          </Block>
        );
      }
      default:
        return null;
    }
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth={true}>
      <DialogTitle>{locales.COSMOS_ASSETS_ADD_UTILITY_TITLE}</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {CosmosAssetAddUtilityLabels.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                {getStepContent()}
                <Box sx={{ mb: 2 }}>
                  <div>
                    {activeStep === AddCosmosAssetSteps.ADD_TO_PROFILE ? (
                      selectedAssets && selectedAssets?.length > 0 ? (
                        <LoadingButton
                          variant="contained"
                          onClick={handleAddToProfile}
                          sx={{ mt: 1, mr: 1 }}
                          disabled={loading}
                          loading={loading}
                          loadingPosition={"start"}
                          startIcon={
                            !loading && addedToProfile ? (
                              <CheckCircle />
                            ) : (
                              <QueueIcon />
                            )
                          }
                        >
                          {locales.ADD_TO_PROFILE}
                        </LoadingButton>
                      ) : (
                        <Button
                          variant={"contained"}
                          sx={{ mt: 1, mr: 1 }}
                          onClick={handleClose}
                        >
                          {locales.CLOSE}
                        </Button>
                      )
                    ) : (
                      <Button
                        variant={"contained"}
                        sx={{ mt: 1, mr: 1 }}
                        onClick={handleNext}
                      >
                        {locales.CONTINUE}
                      </Button>
                    )}

                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      {locales.BACK}
                    </Button>
                    {activeStep === AddCosmosAssetSteps.SELECT_CURRENCIES &&
                    selectedAssets?.length ? (
                      <Button
                        sx={{ mt: 1, mr: 1 }}
                        onClick={hanldeAddableAssetsReset}
                      >
                        {locales.RESET}
                      </Button>
                    ) : null}
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
    </Dialog>
  );
};

export default CosmosAddUtilityStepper;
