import { Button, Typography } from "@material-ui/core";
import { Block } from "components/block";
import config from "config";
import locales from "locales/strings";
import React from "react";

import { Field } from "./field";

const { mainAsset } = config;

interface Props {
  readonly onNext: () => void;
}

export const Tab1: React.FC<Props> = (props: Props): React.ReactElement => {
  return (
    <Block className={"google-signer-request-authorization-to-sign-content"}>
      <Block
        className={"google-signer-request-authorization-to-sign-content-inner"}
      >
        <Block
          className={
            "google-signer-request-authorization-to-sign-content-title"
          }
        >
          <Typography variant={"h4"}>
            {locales.A_REQUEST_TO_SIGN_WAS_MADE}
          </Typography>
        </Block>
        <Block
          className={
            "google-signer-request-authorization-to-sign-content-details"
          }
        >
          <div
            className={
              "google-signer-request-authorization-to-sign-content-details-entries"
            }
            data-key={"entries"}
          >
            <Block
              className={
                "google-signer-request-authorization-to-sign-content-details-entries-entry"
              }
            >
              <Block
                className={
                  "google-signer-request-authorization-to-sign-content-details-entries-entry-icon"
                }
              >
                <i className={"fa fa-paper-plane"} />
              </Block>
              <Block
                className={
                  "google-signer-request-authorization-to-sign-content-details-entries-entry-text"
                }
              >
                <Block
                  className={
                    "google-signer-request-authorization-to-sign-content-details-entries-entry-text-line1"
                  }
                >
                  <Typography variant={"subtitle1"}>
                    {locales.YOU_ARE_SENDING}{" "}
                  </Typography>
                  <Typography
                    variant={"subtitle1"}
                    color={"primary"}
                    data-key={"entry-amount"}
                  />
                  <Typography variant={"subtitle1"} color={"primary"}>
                    {" "}
                    {mainAsset.name}
                  </Typography>
                </Block>
                <Block
                  className={
                    "google-signer-request-authorization-to-sign-content-details-entries-entry-text-line2"
                  }
                >
                  <Typography variant={"subtitle2"} color={"textSecondary"}>
                    {locales.TO}{" "}
                  </Typography>
                  <Typography
                    color={"textSecondary"}
                    variant={"subtitle2"}
                    data-key={"entry-recipient"}
                  />
                </Block>
              </Block>
            </Block>
          </div>
          <Field
            label={locales.FEE}
            render={(): React.ReactElement => (
              <>
                <Typography component={"span"} data-key={"fee"} />
                <Typography component={"span"}> {mainAsset.name}</Typography>
              </>
            )}
          />
          <Field
            label={locales.NET_AMOUNT}
            render={(): React.ReactElement => (
              <>
                <Typography component={"span"} data-key={"sum"} />
                <Typography component={"span"}> {mainAsset.name}</Typography>
              </>
            )}
          />
          <Field
            label={locales.TOTAL}
            render={(): React.ReactElement => (
              <>
                <Typography component={"span"} data-key={"total"} />
                <Typography component={"span"}> {mainAsset.name}</Typography>
              </>
            )}
          />
        </Block>
      </Block>
      <Block
        className={
          "google-signer-request-authorization-to-sign-content-buttons"
        }
      >
        <Button variant={"text"} color={"primary"} onClick={props.onNext}>
          {locales.SHOW_TRANSACTION}
        </Button>
        <Button variant={"contained"} color={"primary"} data-button={"accept"}>
          {locales.APPROVE}
        </Button>
        <Button data-button={"reject"}>{locales.CANCEL}</Button>
      </Block>
    </Block>
  );
};
