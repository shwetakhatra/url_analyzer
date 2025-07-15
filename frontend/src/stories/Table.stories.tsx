import { Table } from "../components/ui/table/Table";

export default {
  title: "Components/Table",
  component: Table,
};

const sampleColumns = [
  {
    header: "ID",
    accessorKey: "id",
  },
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Status",
    accessorKey: "status",
  },
];

const sampleData = [
  { id: 1, name: "Google", status: "Active" },
  { id: 2, name: "Facebook", status: "Inactive" },
  { id: 3, name: "Twitter", status: "Active" },
  { id: 4, name: "LinkedIn", status: "Active" },
  { id: 5, name: "Instagram", status: "Inactive" },
];

interface SampleColumn {
  header: string;
  accessorKey: string;
}

interface SampleData {
  id: number;
  name: string;
  status: string;
}

interface DefaultProps {
  columns: SampleColumn[];
  data: SampleData[];
  isLoading: boolean;
  error: string | null;
  onRowClick: (row: SampleData) => void;
}

const defaultProps: DefaultProps = {
  columns: sampleColumns,
  data: sampleData,
  isLoading: false,
  error: null,
  onRowClick: (row) => alert(`Row clicked: ${row.id}`),
};

export const Default = () => <Table {...defaultProps} />;

export const Empty = () => <Table {...defaultProps} data={[]} />;
