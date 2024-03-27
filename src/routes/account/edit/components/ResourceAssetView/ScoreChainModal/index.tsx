import "./style.scss";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  LinearProgress,
  Typography,
} from "@material-ui/core";
import { Speed } from "@material-ui/icons";
import { LoadingButton } from "@mui/lab";
import {
  ArcElement,
  Chart as ChartJS,
  ChartData,
  Legend,
  Tooltip,
} from "chart.js";
import { Block } from "components/block";
import { LoadingView } from "components/LoadingView";
import strings from "locales/strings";
import React from "react";
import { Pie } from "react-chartjs-2";
import { ScoreChainBtcScore, ScoreRelationship } from "types/scoreChainResult";
import checkExistingBTCScore from "utils/checkExistingScore";
import generateBTCScore from "utils/generateScore";

export const CHART_COLORS = {
  red: "rgb(255, 99, 132)",
  orange: "rgb(255, 159, 64)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
  grey: "rgb(201, 203, 207)",
};

interface Props {
  starAddress: string | null;
  btcAddress: string;
  show: boolean;
  onClose: () => void;
}

ChartJS.register(ArcElement, Tooltip, Legend);

const ScoreChainModal = (props: Props): React.ReactElement => {
  const { btcAddress, starAddress, show, onClose } = props;

  const [score, setScore] = React.useState<ScoreChainBtcScore | null>(null);
  const [generatingScore, setGeneratingScore] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [scoreError, setScoreError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!show) {
      setScore(null);
    }
    if (!show || !starAddress || !btcAddress) return;
    setLoading(true);
    checkExistingBTCScore(starAddress, btcAddress)
      .then((response) => {
        if (response.error) {
          console.warn(response.error);
        } else {
          setScoreError(null);
          setScore(response.result);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [btcAddress, show, starAddress]);

  const handleGenerate = (): void => {
    if (!starAddress) return;
    setScoreError(null);
    setGeneratingScore(true);
    setLoading(true);
    generateBTCScore(starAddress, btcAddress)
      .then((response) => {
        if (response.error) {
          setScoreError(response.error);
        } else {
          setScoreError(null);
          setScore(response.result);
        }
      })
      .finally(() => {
        setLoading(false);
        setGeneratingScore(false);
      });
  };

  const convertToChartData = (
    data: ReadonlyArray<ScoreRelationship>,
  ): ChartData<any> => {
    return data.reduce(
      (acc, { label, ...otherProps }) => {
        if (acc.labels) acc.labels.push(label);
        acc.datasets[0].data.push(otherProps);
        return acc;
      },
      {
        labels: new Array<string>(),
        datasets: [
          {
            label: "Incoming bitcoins",
            backgroundColor: Object.values(CHART_COLORS),
            data: new Array<{
              percent: number;
              value: number;
              scx: number;
            }>(),
            hoverOffset: 12,
          },
        ],
      } as ChartData<any>,
    );
  };

  return (
    <Dialog open={show} onClose={onClose} fullWidth={true}>
      {starAddress ? (
        <>
          <DialogTitle>{strings.GENERATE_BTC_ADDRESS_SCORE}</DialogTitle>
          <DialogContent className={"dialog-content-container"}>
            {loading ? (
              <Block className={"score-loading-container"}>
                <Typography align={"center"}>
                  {generatingScore
                    ? strings.GENERATING_SCORE_FOR_ADDRESS
                    : strings.FETCHING_SCORE_FOR_ADDRESS}
                </Typography>
                <LinearProgress />
              </Block>
            ) : scoreError ? (
              <FormHelperText error={!!scoreError}>{scoreError}</FormHelperText>
            ) : !score ? (
              <Block>
                <Typography variant={"h6"} align={"center"} gutterBottom>
                  {strings.NO_PREVIOUS_SCORE_FOUND}
                </Typography>
                <Typography variant={"subtitle2"} align={"center"} gutterBottom>
                  {strings.CLICK_TO_GENERATE_SCORE}
                </Typography>
              </Block>
            ) : (
              <Block>
                <Block className="score-container">
                  Score: <span>{score.scx}</span>
                  <i>/100</i>
                </Block>
                <Block className={"chart-container"}>
                  <Pie
                    data={convertToChartData(score.relationships)}
                    options={{
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                        tooltip: {
                          callbacks: {
                            label: (item): string => item.label,
                            footer: (items): string => {
                              const data = items[0].dataset.data[
                                items[0].dataIndex
                              ] as unknown as {
                                percent: number;
                                value: number;
                                scx: number;
                              };
                              return `${data.percent}% | ${data.value} BTC | Score: ${data.scx}`;
                            },
                          },
                        },
                      },
                      parsing: {
                        key: "percent",
                      },
                    }}
                  />
                </Block>
              </Block>
            )}
          </DialogContent>
          <DialogActions>
            <LoadingButton
              startIcon={<Speed />}
              loading={loading}
              loadingPosition={"start"}
              disabled={loading ? true : score ? true : false}
              color={"primary"}
              variant={"contained"}
              onClick={handleGenerate}
            >
              {strings.GENERATE}
            </LoadingButton>
            <Button onClick={onClose}>{strings.CANCEL}</Button>
          </DialogActions>
        </>
      ) : (
        <LoadingView />
      )}
    </Dialog>
  );
};

export default ScoreChainModal;
