import locales from "locales/strings";
import { Row } from "routes/transactions/components/TxTable/TxDetail/row";
import { Starname } from "types/resolveResponse";
import {
  DelegationData,
  ITransaction as Transaction,
  RedelegationData,
} from "types/transaction";
import { formatAmount, formatTimestamp } from "utils/formatters";

const rows: ReadonlyArray<Row> = [
  {
    cells: [
      {
        label: locales.SENDER,
        value: "sender",
        key: "sender",
      },
      {
        label: locales.TIME,
        value: "time",
        key: "time",
        format: formatTimestamp,
      },
      {
        label: locales.TRANSACTION_FEE,
        value: "fee",
        key: "fee",
        format: formatAmount,
      },
    ],
  },
  {
    cells: [
      {
        label: (transaction: Transaction): string => {
          const type = transaction.type as string;
          if (type.includes("Domain")) {
            return "Type";
          } else {
            return "";
          }
        },
        value: (transaction: Transaction): string => {
          const type = transaction.type as string;
          if (type.includes("Domain")) {
            const data: string | Starname | RedelegationData | DelegationData =
              transaction.data;
            if (typeof data === "string") return data;
            return "";
          } else {
            return "";
          }
        },
        key: "recipient",
      },
      {
        label: locales.EMPTY_STRING,
        key: "empty1",
      },
      {
        label: locales.TRANSACTION_ID,
        value: "id",
        key: "id",
      },
    ],
  },
  {
    cells: [
      {
        label: locales.NOTE,
        value: "note",
        key: "note",
      },
      {
        label: locales.EMPTY_STRING,
        key: "empty3",
      },
      {
        label: locales.EMPTY_STRING,
        key: "empty4",
      },
    ],
  },
];

export default rows;
