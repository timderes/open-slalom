import { Table, type TableProps } from "@mantine/core";

type ScrollableTableProps = TableProps;

const ScrollableTable = ({ ...props }: ScrollableTableProps) => {
  return (
    <Table.ScrollContainer minWidth={700}>
      <Table {...props} />
    </Table.ScrollContainer>
  );
};

export default ScrollableTable;
