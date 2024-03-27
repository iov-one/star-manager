import "./style.scss";

import { Card, CardContent, Chip, Typography } from "@mui/material";
import api from "api";
import { Block } from "components/block";
import strings from "locales/strings";
import React from "react";
import { Amount } from "types/amount";
import { Escrow, isEscrowDomainObject } from "types/escrow";

interface Props {
  escrow: Escrow;
}

const EscrowDetails = (props: Props): React.ReactElement => {
  const { escrow } = props;
  const { price, object, seller } = escrow;

  const [loading, setLoading] = React.useState<boolean>(false);
  const [sellerName, setSellerName] = React.useState<string | null>(null);

  const validUntil = isEscrowDomainObject(object)
    ? object.value.valid_until
    : object.valid_until;
  const validityDate = new Date(parseInt(validUntil) * 1000);
  const priceAmount = Amount.from(Math.ceil(parseFloat(price[0].amount)));

  React.useEffect(() => {
    setLoading(true);
    api
      .getAccountsWithOwner(seller)
      .run()
      .then((accounts) => {
        if (accounts.length > 0) setSellerName(accounts[0].toString());
      })
      .finally(() => setLoading(false));
  }, []);
  return (
    <Block className="escrow-data-card-outer-container">
      <Card variant="outlined">
        <CardContent>
          <Block className="escrow-data-outer-container">
            <Block className="escrow-data-header">
              <Typography variant="subtitle2">
                {strings.STARNAME_AVAILABLE_FROM_ESCROW +
                  (loading
                    ? "..."
                    : sellerName ?? strings.ANOTHER_USER.toLowerCase())}
              </Typography>
              <Chip
                style={{
                  backgroundColor: "#8f53b8",
                  borderRadius: 8,
                  color: "white",
                }}
                label={strings.FOR_SALE}
              />
            </Block>
            <Block className="escrow-data-container">
              <Block>
                <Typography variant={"body1"}>{strings.PRICE}</Typography>
                <Typography variant={"body2"}>
                  {priceAmount.format(true)}
                </Typography>
              </Block>
              <Block>
                <Typography variant={"body1"}>{strings.TYPE}</Typography>
                <Typography variant={"body2"}>
                  {isEscrowDomainObject(object)
                    ? object.value.type
                    : strings.ACCOUNT}
                </Typography>
              </Block>
              <Block>
                <Typography variant={"body1"}>
                  {strings.STARNAME + " " + strings.VALID_UNTIL.toLowerCase()}
                </Typography>
                <Typography variant={"body2"}>
                  {validityDate.toDateString()}
                </Typography>
              </Block>
            </Block>
          </Block>
        </CardContent>
      </Card>
    </Block>
  );
};

export default EscrowDetails;
