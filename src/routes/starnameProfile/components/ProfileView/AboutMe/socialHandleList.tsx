import React from "react";
import { SocialItem } from "types/socialItem";

import { SocialHandle } from "./socialHandle";

interface Props {
  readonly handles: ReadonlyArray<SocialItem>;
}

export const SocialHandleList: React.FC<Props> = (
  props: Props,
): React.ReactElement => {
  const { handles } = props;
  return (
    <>
      {handles.map(
        (handle: SocialItem): React.ReactElement => (
          <SocialHandle
            key={handle.network}
            handle={handle.name}
            network={handle.network}
            certified={handle.certified}
          />
        ),
      )}
    </>
  );
};
