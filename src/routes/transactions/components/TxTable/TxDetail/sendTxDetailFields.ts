import locales from "locales/strings";
import { Row } from "routes/transactions/components/TxTable/TxDetail/row";
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
        label: locales.RECIPIENT,
        value: "data",
        key: "recipient",
      },
      {
        label: locales.TRANSACTION_ID,
        value: "id",
        key: "id",
      },
      {
        label: locales.EMPTY_STRING,
        key: "empty1",
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
