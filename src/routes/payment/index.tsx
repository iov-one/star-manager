import {
  SendPaymentStore,
  SendPaymentStoreContext,
} from "mobx/stores/sendPaymentStore";
import React from "react";
import SendPaymentForm from "routes/payment/components/sendPaymentForm";

const Payment: React.FC = (): React.ReactElement => {
  return (
    <SendPaymentStoreContext.Provider value={new SendPaymentStore()}>
      <SendPaymentForm />
    </SendPaymentStoreContext.Provider>
  );
};

export default Payment;
