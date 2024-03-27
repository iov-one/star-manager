export interface Warning {
  readonly title: string;
  readonly message: string;
  readonly action: {
    readonly handler: () => void;
    readonly label: string;
  };
}
