import React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  TableOptions,
  PaginationState,
  OnChangeFn,
} from "@tanstack/react-table";
import styles from "./Table.module.css";
import { Button } from "../button/Button";

type TableProps<T extends object> = {
  data: T[];
  columns: ColumnDef<T, any>[];
  emptyMessage?: string;
  options?: Partial<TableOptions<T>>;
  getRowProps?: (row: any) => React.HTMLAttributes<HTMLTableRowElement>;
  selectable?: boolean;
  selectedRowIds?: string[];
  rowIdAccessor?: (row: T) => string;
  onSelectRow?: (id: string, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
  enableSorting?: boolean;
  enablePagination?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  totalCount?: number;
};

export function Table<T extends object>({
  data,
  columns,
  emptyMessage = "No data found.",
  options = {},
  getRowProps,
  selectable = false,
  selectedRowIds = [],
  rowIdAccessor = (row: any) => row.ID,
  onSelectRow,
  onSelectAll,
  enableSorting = false,
  enablePagination = false,
  pagination: controlledPagination,
  onPaginationChange,
  totalCount,
}: TableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  if (enablePagination && (!controlledPagination || !onPaginationChange)) {
    throw new Error(
      "Table: When enablePagination is true, you must provide both pagination and onPaginationChange props.",
    );
  }

  const pagination = controlledPagination;
  const setPagination: OnChangeFn<PaginationState> = (updaterOrValue) => {
    if (onPaginationChange) {
      if (typeof updaterOrValue === "function") {
        if (pagination) {
          onPaginationChange(
            (updaterOrValue as (old: PaginationState) => PaginationState)(
              pagination,
            ),
          );
        }
      } else {
        onPaginationChange(updaterOrValue);
      }
    }
  };
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    onSortingChange: enableSorting ? setSorting : undefined,
    state: {
      ...(enableSorting ? { sorting } : {}),
      ...(enablePagination ? { pagination } : {}),
    },
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    onPaginationChange: enablePagination ? setPagination : undefined,
    ...options,
  });

  return (
    <div className="w-full overflow-x-auto rounded-xl bg-white shadow p-4 mb-6">
      <table className="min-w-full text-sm">
        <thead className={styles.tableHeader}>
          {table.getHeaderGroups().map((headerGroup, i) => (
            <tr key={headerGroup.id}>
              {selectable && i === 0 && (
                <th
                  className="p-3 text-left font-semibold"
                  style={{ whiteSpace: "nowrap" }}
                >
                  <input
                    type="checkbox"
                    checked={
                      selectedRowIds.length === data.length && data.length > 0
                    }
                    onChange={(e) =>
                      onSelectAll && onSelectAll(e.target.checked)
                    }
                    className="w-5 h-5 accent-purple-800"
                  />
                </th>
              )}
              {headerGroup.headers.map((header) => {
                const isSortable = enableSorting && header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    className={
                      "p-3 text-left font-semibold select-none" +
                      (isSortable ? " cursor-pointer hover:underline" : "")
                    }
                    style={{ whiteSpace: "nowrap" }}
                    onClick={
                      isSortable
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <span className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {isSortable && (
                        <span className="ml-1 text-xs">
                          {sorted === "asc" ? (
                            <i
                              className="fa fa-arrow-up"
                              aria-label="sorted ascending"
                            />
                          ) : sorted === "desc" ? (
                            <i
                              className="fa fa-arrow-down"
                              aria-label="sorted descending"
                            />
                          ) : (
                            <i
                              className="fa fa-sort opacity-40"
                              aria-label="sortable"
                            />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200">
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="text-center py-4 text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50"
                {...(getRowProps ? getRowProps(row) : {})}
              >
                {selectable && (
                  <td className="p-3 align-top">
                    <input
                      type="checkbox"
                      checked={selectedRowIds.includes(
                        rowIdAccessor(row.original),
                      )}
                      onChange={(e) =>
                        onSelectRow &&
                        onSelectRow(
                          rowIdAccessor(row.original),
                          e.target.checked,
                        )
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 accent-blue-500"
                    />
                  </td>
                )}
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {enablePagination && (
        <div className="flex items-center justify-between mt-4">
          <div>
            <Button
              variant="outline"
              onClick={() =>
                table.setPageIndex(Math.max(0, pagination!.pageIndex - 1))
              }
              disabled={pagination!.pageIndex === 0}
              className="px-2 py-1 mr-2 border rounded disabled:opacity-50"
            >
              Prev
            </Button>
            <Button
              variant="outline"
              onClick={() => table.setPageIndex(pagination!.pageIndex + 1)}
              disabled={
                totalCount !== undefined
                  ? (pagination!.pageIndex + 1) * pagination!.pageSize >=
                    totalCount
                  : data.length <= pagination!.pageSize
              }
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              Next
            </Button>
          </div>
          <div>
            Page <b>{pagination!.pageIndex + 1}</b>
            {totalCount !== undefined ? (
              <>
                {" "}
                of{" "}
                <b>
                  {Math.max(1, Math.ceil(totalCount / pagination!.pageSize))}
                </b>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
