import { ITransaction as Transaction } from "types/transaction";

export interface Cell {
  label: string | ((tx: Transaction) => string);
  value?: keyof Transaction | ((tx: Transaction) => string);
  alignment?: "left" | "center" | "right";
  format?: (value: any) => string;
  key: string;
}
