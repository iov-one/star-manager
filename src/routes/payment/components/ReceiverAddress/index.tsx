import { Typography } from "@material-ui/core";
import { Block } from "components/block";
import locales from "locales/strings";
import { SendPaymentStore } from "mobx/stores/sendPaymentStore";
import { observer } from "mobx-react";
import React from "react";
import { CertifiedLabelTag } from "routes/payment/components/ReceiverAddress/certifiedLabelTag";
import { DebouncedInput } from "routes/payment/components/ReceiverAddress/debouncedInput";

interface Props {
  readonly store: SendPaymentStore;
  readonly validated?: boolean;
  readonly disabled: boolean;
}

const ReceiverAddress = observer((props: Props): React.ReactElement => {
  const [value, setValue] = React.useState<string>("");
  const { store } = props;
  React.useEffect((): (() => void) => {
    return store.setAddressOrStarname(value);
  }, [store, value]);
  return (
    <Block width={"100%"} display={"flex"} flexDirection={"column"}>
      <Block display={"flex"} alignItems={"center"}>
        <Typography color={"textPrimary"} variant={"subtitle2"}>
          {locales.TO}
        </Typography>
        <CertifiedLabelTag validated={store.certified} />
      </Block>
      <Block width={"100%"} marginTop={8}>
        <DebouncedInput
          placeholder={locales.RECEIVER_ADDRESS_OR_STARNAME_TEXTFIELD}
          disabled={props.disabled}
          fullWidth={true}
          showSpinner={store.resolving}
          onChange={setValue}
        />
      </Block>
    </Block>
  );
});

export default ReceiverAddress;
