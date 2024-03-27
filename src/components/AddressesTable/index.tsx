import "./styles.scss";

import { AddressRow } from "components/AddressesTable/components/AddressRow";
import { Block } from "components/block";
import locales from "locales/strings";
import React from "react";
import { ResourceInfo } from "types/resourceInfo";

interface Props {
  readonly targets: ReadonlyArray<ResourceInfo>;
}

const AddressesTable: React.FC<Props> = (
  props: Props,
): React.ReactElement | null => {
  const { targets } = props;
  const [items, setItems] = React.useState<ReadonlyArray<ResourceInfo>>([]);

  React.useEffect(() => {
    setItems(
      targets
        .slice()
        .sort((a: ResourceInfo, b: ResourceInfo) =>
          a.id.localeCompare(b.id, undefined, { sensitivity: "base" }),
        ),
    );
  }, [targets]);

  if (items.length === 0) return null;

  return (
    <Block className={"address-table"}>
      <Block className={"address-table-header"}>
        <Block className={"address-table-header-cell"}>
          {locales.BLOCKCHAIN}
        </Block>
        <Block className={"address-table-header-cell"}>{locales.ADDRESS}</Block>
        <Block className={"address-table-header-cell"} />
      </Block>
      <Block>
        {items.map((target: ResourceInfo) => (
          <AddressRow key={target.id} target={target} />
        ))}
      </Block>
    </Block>
  );
};

export default AddressesTable;
