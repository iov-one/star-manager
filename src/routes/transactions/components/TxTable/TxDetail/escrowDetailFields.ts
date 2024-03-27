import strings from "locales/strings";
import { formatAmount, formatDeadline } from "utils/formatters";

import { Row } from "./row";

const createEscrowTxRows: ReadonlyArray<Row> = [
  {
    cells: [
      {
        label: strings.SELLER,
        value: "seller",
        key: "seller",
      },
      {
        label: strings.DEADLINE,
        value: "deadline",
        key: "deadline",
        format: formatDeadline,
      },
      {
        label: strings.ESCROW_ID,
        value: "escrowId",
        key: "escrowId",
      },
    ],
  },
  {
    cells: [
      {
        label: strings.TRANSACTION_FEE,
        value: "fee",
        key: "fee",
        format: formatAmount,
      },
      {
        label: strings.TIME,
        value: "time",
        key: "time",
        format: (value: Date): string => value.toLocaleTimeString(),
      },
      {
        label: strings.TRANSACTION_ID,
        value: "id",
        key: "id",
      },
    ],
  },
  {
    cells: [
      {
        label: strings.NOTE,
        value: "note",
        key: "note",
      },
      {
        label: strings.EMPTY_STRING,
        key: "empty1",
      },
      {
        label: strings.EMPTY_STRING,
        key: "empty2",
      },
    ],
  },
];

const updateEscrowTxRows: ReadonlyArray<Row> = [
  {
    cells: [
      {
        label: strings.UPDATER,
        key: "updater",
        value: "updater",
      },
      {
        label: strings.SELLER,
        key: "seller",
        value: "seller",
      },
      {
        label: strings.DEADLINE,
        key: "deadline",
        value: "deadline",
        format: formatDeadline,
      },
    ],
  },
  {
    cells: [
      {
        label: strings.TIME,
        value: "time",
        key: "time",
        format: (value: Date): string => value.toLocaleTimeString(),
      },
      {
        label: strings.TRANSACTION_ID,
        value: "id",
        key: "id",
      },
      {
        label: strings.NOTE,
        value: "note",
        key: "note",
      },
    ],
  },
];
const refundEscrowTxRows: ReadonlyArray<Row> = [
  {
    cells: [
      {
        label: strings.SENDER,
        value: "sender",
        key: "sender",
      },
      {
        label: strings.ESCROW_ID,
        value: "data",
        key: "escrowId",
      },
      {
        label: strings.TRANSACTION_FEE,
        value: "fee",
        key: "fee",
        format: formatAmount,
      },
    ],
  },
  {
    cells: [
      {
        label: strings.TIME,
        value: "time",
        key: "time",
        format: (value: Date): string => value.toLocaleTimeString(),
      },
      {
        label: strings.TRANSACTION_ID,
        value: "id",
        key: "id",
      },
      {
        label: strings.NOTE,
        value: "note",
        key: "note",
      },
    ],
  },
];
const transferToEscrowTxRows: ReadonlyArray<Row> = [
  {
    cells: [
      {
        label: strings.BUYER,
        key: "buyer",
        value: "buyer",
      },
      {
        label: strings.ESCROW_ID,
        value: "data",
        key: "escrowId",
      },
      {
        label: strings.TRANSACTION_FEE,
        value: "fee",
        key: "fee",
        format: formatAmount,
      },
    ],
  },
  {
    cells: [
      {
        label: strings.TIME,
        value: "time",
        key: "time",
        format: (value: Date): string => value.toLocaleTimeString(),
      },
      {
        label: strings.TRANSACTION_ID,
        value: "id",
        key: "id",
      },
      {
        label: strings.NOTE,
        value: "note",
        key: "note",
      },
    ],
  },
];

export {
  createEscrowTxRows,
  updateEscrowTxRows,
  refundEscrowTxRows,
  transferToEscrowTxRows,
};
