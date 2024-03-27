import React, { SVGProps } from "react";

export interface MenuItemDef<T = any> {
  readonly key: string;
  readonly label: string | React.ReactElement;
  readonly action: string | (() => void);
  readonly icon: React.FC<SVGProps<SVGSVGElement>> | null;
  readonly data?: T;
}
