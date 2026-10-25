import { Box, Table } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { GenericText } from '@/components/ui/text/GenericText';

export type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
};

type Props<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
};

export function GenericDataTable<T>({
  columns,
  rows,
  getRowKey,
  emptyMessage = 'Sin registros',
  onRowClick,
}: Props<T>) {
  if (rows.length === 0) {
    return (
      <Box bg="white" borderWidth="1px" borderRadius="md" p={4}>
        <GenericText variant="muted">{emptyMessage}</GenericText>
      </Box>
    );
  }

  return (
    <Box bg="white" borderWidth="1px" borderRadius="md" overflowX="auto">
      <Table.Root size="sm" variant="line">
        <Table.Header>
          <Table.Row>
            {columns.map(col => (
              <Table.ColumnHeader key={col.id} textAlign={col.align ?? 'left'}>
                <GenericText variant="label">{col.header}</GenericText>
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map(row => (
            <Table.Row
              key={getRowKey(row)}
              cursor={onRowClick ? 'pointer' : undefined}
              _hover={onRowClick ? { bg: 'gray.50' } : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map(col => (
                <Table.Cell key={col.id} textAlign={col.align ?? 'left'}>
                  {col.cell(row)}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
