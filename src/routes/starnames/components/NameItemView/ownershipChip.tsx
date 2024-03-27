import { Chip } from "@material-ui/core";
import strings from "locales/strings";
import React from "react";
import { OwnershipType } from "types/nameItem";

interface Props {
  ownership: OwnershipType;
}

const OwnershipChip = (props: Props): React.ReactElement | null => {
  const { ownership } = props;
  if (ownership === OwnershipType.Self) return null;
  return (
    <Chip
      style={{
        backgroundColor:
          ownership === OwnershipType.Loaned ||
          ownership === OwnershipType.Admin
            ? "#009688"
            : "#8f53b8",
      }}
      color="primary"
      size="small"
      label={
        ownership === OwnershipType.Loaned || ownership === OwnershipType.Admin
          ? strings.LOANED
          : strings.FOR_SALE
      }
    />
  );
};

export default OwnershipChip;
