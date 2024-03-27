export enum SortOrder {
  Descending,
  Ascending,
  None,
}

export interface SortingStateProps {
  readonly order: SortOrder;
}
