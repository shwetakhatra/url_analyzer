import ConfirmModal from "../components/ui/modal/ConfirmModal";
import React, { useState, useEffect } from "react";
import {
  fetchUrlsApi,
  submitUrlApi,
  bulkStartApi,
  bulkDeleteApi,
  rowActionApi,
} from "../api/dashboard";
import { toast } from "react-toastify";
import { Header } from "../components/layout/Header";
import { Table } from "../components/ui/table/Table";
import { useNavigate } from "react-router-dom";

type UrlRecord = {
  ID: string;
  Title: string;
  URL: string;
  Status: string;
  HTMLVersion: string;
  InternalLinks: number;
  ExternalLinks: number;
  BrokenLinks: number;
};

const DashboardPage: React.FC = () => {
  const [urls, setUrls] = useState<UrlRecord[]>([]);
  const [urlInput, setUrlInput] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [bulkAction, setBulkAction] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize] = useState<number>(5);
  const [totalCount, setTotalCount] = useState<number>(0);
  const navigate = useNavigate();

  interface ColumnDef<T> {
    id?: string;
    accessorKey?: keyof T;
    header: string;
    cell: (info: any) => React.ReactNode;
    size?: number;
    enableSorting?: boolean;
  }

  interface RowInfo<T> {
    row: { index: number };
    getValue: () => T[keyof T];
  }

  // Row action handler (start/stop/requeue)
  const handleRowAction = React.useCallback(
    async (action: "start" | "stop" | "requeue", id: string) => {
      try {
        const token = localStorage.getItem("token") || "";
        await rowActionApi(token, action, id);
        toast.success(
          `${action.charAt(0).toUpperCase() + action.slice(1)} triggered!`,
        );
        fetchUrls(pageIndex, pageSize);
      } catch (error) {
        toast.error(`Failed to ${action} process`);
      }
    },
    [pageIndex, pageSize],
  );

  // Table columns definition
  const columns: ColumnDef<UrlRecord>[] = React.useMemo(
    () => [
      {
        id: "rowNumber",
        header: "#",
        cell: ({ row }: RowInfo<UrlRecord>) => pageIndex * pageSize + row.index + 1,
        size: 50,
        enableSorting: false,
      },
      {
        accessorKey: "Title",
        header: "Title",
        cell: (info: { getValue: () => string }) => info.getValue(),
        enableSorting: true,
      },
      {
        accessorKey: "URL",
        header: "URL",
        cell: (info: { getValue: () => string }) => (
          <a
            href={info.getValue()}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-blue-600 hover:underline"
          >
            {info.getValue()}
          </a>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "HTMLVersion",
        header: "HTML Version",
        cell: (info: { getValue: () => string }) => info.getValue(),
        enableSorting: true,
      },
      {
        accessorKey: "InternalLinks",
        header: "Internal Links",
        cell: (info: { getValue: () => number }) => info.getValue(),
        enableSorting: true,
      },
      {
        accessorKey: "ExternalLinks",
        header: "External Links",
        cell: (info: { getValue: () => number }) => info.getValue(),
        enableSorting: true,
      },
      {
        accessorKey: "BrokenLinks",
        header: "Broken Links",
        cell: (info: { getValue: () => number }) => info.getValue(),
        enableSorting: true,
      },
      {
        accessorKey: "Status",
        header: "Status",
        cell: (info: { getValue: () => string }) => {
          const status = info.getValue().toLowerCase();
          let percent = 0;
          let barColor = "bg-gray-300";
          let labelColor = "text-gray-800";
          if (status === "queued") {
            percent = 0;
            barColor = "bg-gray-300";
            labelColor = "text-gray-800";
          } else if (status === "running") {
            percent = 70;
            barColor = "bg-yellow-400 animate-pulse";
            labelColor = "text-yellow-800";
          } else if (status === "done") {
            percent = 100;
            barColor = "bg-green-500";
            labelColor = "text-green-800";
          } else if (status === "error") {
            percent = 100;
            barColor = "bg-red-500";
            labelColor = "text-red-800";
          }
          return (
            <div className="flex flex-col min-w-[100px]">
              <span className={`text-xs font-medium mb-1 ${labelColor}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
              <div className="w-full h-2 bg-gray-200 rounded">
                <div
                  className={`h-2 rounded transition-all duration-500 ${barColor}`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }: { row: { original: UrlRecord } }) => {
          const status = row.original.Status?.toLowerCase();
          return (
            <div className="flex gap-2">
              <button
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded disabled:opacity-50"
                disabled={status === "running"}
                title="Start/Requeue"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleRowAction("start", row.original.ID);
                }}
              >
                Start
              </button>
              <button
                className="px-2 py-1 text-xs bg-yellow-500 text-white rounded disabled:opacity-50"
                disabled={status !== "running"}
                title="Stop"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleRowAction("stop", row.original.ID);
                }}
              >
                Stop
              </button>
            </div>
          );
        },
        enableSorting: false,
        size: 120,
      },
    ],
    [pageIndex, pageSize],
  );

  useEffect(() => {
    fetchUrls(pageIndex, pageSize);
  }, [pageIndex, pageSize]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUrls(pageIndex, pageSize);
    }, 5000);
    return () => clearInterval(interval);
  }, [pageIndex, pageSize]);

  // Fuzzy search filter
  const fuzzyMatch = React.useCallback(
    (str: string, pattern: string): boolean => {
      pattern = pattern.split("").reduce((a, b) => a + ".*" + b);
      return new RegExp(pattern, "i").test(str);
    },
    [],
  );

  // Fuzzy search should apply to all records, not just the current page
  const filteredUrls = React.useMemo<UrlRecord[]>(() => {
    if (!searchTerm.trim()) return urls;
    return urls.filter(
      (url) =>
        fuzzyMatch(url.Title || "", searchTerm) ||
        fuzzyMatch(url.URL || "", searchTerm) ||
        fuzzyMatch(url.Status || "", searchTerm),
    );
  }, [urls, searchTerm, fuzzyMatch]);

  // Row selection handlers
  const handleSelectRow = React.useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id),
    );
  }, []);

  const handleSelectAll = React.useCallback(
    (checked: boolean) => {
      setSelectedIds(checked ? urls.map((u) => u.ID) : []);
    },
    [urls],
  );

  // Row click handler for navigation
  const getRowProps = React.useCallback(
    (row: { original: UrlRecord }) => ({
      style: { cursor: "pointer" },
      onClick: (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).tagName !== "INPUT") {
          navigate(`/detail/${row.original.ID}`, {
            state: {
              urlRecord: row.original,
            },
          });
        }
      },
    }),
    [navigate],
  );

  const fetchUrls = async (pageIdx = 0, pSize = 5) => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetchUrlsApi(token, pageIdx + 1, pSize);
      setUrls(response.data.urls || []);
      setTotalCount(
        typeof response.data.total === "number" ? response.data.total : 0,
      );
    } catch (error) {
      toast.error("Failed to fetch URLs");
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }
    try {
      const token = localStorage.getItem("token") || "";
      await submitUrlApi(token, urlInput);
      toast.success("URL submitted successfully!");
      setUrlInput("");
      fetchUrls();
    } catch (error) {
      toast.error("Failed to submit URL. Please try again.");
      console.error(error);
    }
  };

  // Bulk action handler
  useEffect(() => {
    if (bulkAction === "delete" && selectedIds.length > 0) {
      setShowConfirm(true);
    } else if (bulkAction === "start" && selectedIds.length > 0) {
      const startProcessing = async () => {
        try {
          const token = localStorage.getItem("token") || "";
          await bulkStartApi(token, selectedIds);
          toast.success("Start processing triggered for selected URLs!");
          setBulkAction("");
          fetchUrls();
        } catch (error) {
          toast.error("Failed to start processing selected URLs");
          setBulkAction("");
        }
      };
      startProcessing();
    }
  }, [bulkAction]);

  const handleDeleteConfirm = async () => {
    setShowConfirm(false);
    try {
      const token = localStorage.getItem("token") || "";
      await bulkDeleteApi(token, selectedIds);
      toast.success("Selected URLs deleted successfully!");
      setSelectedIds([]);
      setBulkAction("");
      fetchUrls();
    } catch (error) {
      toast.error("Failed to delete selected URLs");
      setBulkAction("");
    }
  };

  return (
    <>
      <Header />
      <ConfirmModal
        open={showConfirm}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowConfirm(false);
          setBulkAction("");
        }}
        count={selectedIds.length}
      />
      <main className="mt-6 px-2 sm:px-4 md:px-8 max-w-6xl mx-auto flex flex-col gap-6 items-center w-full">
        <section className="w-full">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center w-full bg-white rounded-lg shadow p-4"
            aria-label="Crawl new URL"
          >
            <label htmlFor="url-input" className="sr-only">Enter URL to crawl</label>
            <input
              id="url-input"
              type="url"
              placeholder="Enter URL to crawl"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              required
              className="flex-1 px-4 py-3 text-base rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoComplete="off"
              aria-required="true"
            />
            <button
              type="submit"
              className="px-6 py-3 text-base font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
              aria-label="Crawl URL"
            >
              Crawl
            </button>
          </form>
        </section>
        <section className="w-full">
          <div className="flex flex-col sm:flex-row justify-between mb-2 gap-2 items-stretch sm:items-center">
            <div className="flex gap-2 items-center mb-2 sm:mb-0">
              <label htmlFor="bulk-action" className="sr-only">Bulk Action</label>
              <select
                id="bulk-action"
                className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[140px]"
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                disabled={selectedIds.length === 0}
                aria-label="Bulk Action"
              >
                <option value="">Bulk Action</option>
                <option value="start">Start</option>
                <option value="stop">Stop</option>
                <option value="delete">Delete</option>
              </select>
            </div>
            <div className="flex items-center w-full sm:w-auto">
              <label htmlFor="search-input" className="sr-only">Search URLs</label>
              <input
                id="search-input"
                type="text"
                className="border rounded px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search URLs"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-2 sm:p-4 overflow-x-auto mb-4">
            <Table
              data={filteredUrls}
              columns={columns}
              emptyMessage="No URLs found."
              selectable={true}
              selectedRowIds={selectedIds}
              rowIdAccessor={(row) => row.ID}
              onSelectRow={handleSelectRow}
              onSelectAll={handleSelectAll}
              getRowProps={getRowProps}
              enableSorting={true}
              enablePagination={searchTerm.trim() ? false : false}
            />
            <div className="flex items-center justify-between mt-4">
              <div>
                <button
                  onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                  disabled={pageIndex === 0}
                  className="px-2 py-1 mr-2 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPageIndex(pageIndex + 1)}
                  disabled={(pageIndex + 1) * pageSize >= totalCount}
                  className="px-2 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="flex-1"></div>
              <div className="text-right min-w-[100px]">
                Page <b>{pageIndex + 1}</b>
                {totalCount !== undefined ? (
                  <>
                    {" "}of {Math.max(1, Math.ceil(totalCount / pageSize))}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default DashboardPage;
