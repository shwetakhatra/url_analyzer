import ConfirmModal from "../components/ui/modal/ConfirmModal";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Header } from "../components/layout/Header";
import { Table } from "../components/ui/table/Table";

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
  const [urlInput, setUrlInput] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [pageIndex, setPageIndex] = useState(0); // 0-based
  const [pageSize, setPageSize] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

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

  const columns: ColumnDef<UrlRecord>[] = React.useMemo(
    () => [
      {
        id: "rowNumber",
        header: "#",
        cell: ({ row }: RowInfo<UrlRecord>) => row.index + 1,
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
          const style =
            status === "running"
              ? "bg-yellow-100 text-yellow-800"
              : status === "done"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800";
          return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${style}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        },
        enableSorting: true,
      },
    ],
    []
  );

  useEffect(() => {
    fetchUrls(pageIndex, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize]);

  const fetchUrls = async (pageIdx = 0, pSize = 5) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/urls", {
        params: {
          page: pageIdx + 1, // backend expects 1-based
          limit: pSize,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // If backend returns total count, set it; else, estimate
      if (response.data && response.data.urls && typeof response.data.total === "number") {
        setUrls(response.data.urls);
        setTotalCount(response.data.total);
      } else {
        setUrls(response.data);
        setTotalCount((pageIdx + 1) * pSize + (response.data.length === pSize ? pSize : 0));
      }
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
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8080/api/urls",
        { url: urlInput },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
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
      // Bulk start processing
      const startProcessing = async () => {
        try {
          const token = localStorage.getItem("token");
          await axios.put(
            "http://localhost:8080/api/urls/requeue",
            { ids: selectedIds },
            { headers: { Authorization: `Bearer ${token}` } }
          );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulkAction]);

  const handleDeleteConfirm = async () => {
    setShowConfirm(false);
    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:8080/api/urls", {
        data: { ids: selectedIds },
        headers: { Authorization: `Bearer ${token}` },
      });
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
      <main className="mt-8 px-8 max-w-6xl mx-auto flex flex-col gap-8 items-center w-full">
        <section className="w-full">
          <form
            onSubmit={handleSubmit}
            className="flex gap-4 items-center w-full"
          >
            <input
              type="url"
              placeholder="Enter URL to crawl"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              required
              className="flex-1 px-4 py-3 text-base rounded-md border border-gray-300"
            />
            <button
              type="submit"
              className="px-6 py-3 text-base bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Crawl
            </button>
          </form>
        </section>
        <section className="w-full">
          <div className="flex justify-end mb-2">
            <select
              className="border rounded px-3 py-2 text-sm"
              value={bulkAction}
              onChange={e => setBulkAction(e.target.value)}
              disabled={selectedIds.length === 0}
            >
              <option value="">Bulk Action</option>
              <option value="start">Start Processing</option>
              <option value="stop">Stop Processing</option>
              <option value="delete">Delete</option>
            </select>
          </div>
          <Table
            data={urls}
            columns={columns}
            emptyMessage="No URLs found."
            selectable={true}
            selectedRowIds={selectedIds}
            rowIdAccessor={row => row.ID}
            onSelectRow={(id, checked) => {
              setSelectedIds(prev =>
                checked ? [...prev, id] : prev.filter(x => x !== id)
              );
            }}
            onSelectAll={checked => {
              setSelectedIds(checked ? urls.map(u => u.ID) : []);
            }}
            getRowProps={() => ({
              style: { cursor: "pointer" },
            })}
            enableSorting={true}
            enablePagination={true}
            pageSizeOptions={[5, 10, 20, 50]}
            pagination={{ pageIndex, pageSize }}
            onPaginationChange={(updater) => {
              const { pageIndex: newPageIndex, pageSize: newPageSize } =
                typeof updater === "function"
                  ? updater({ pageIndex, pageSize })
                  : updater;
              setPageIndex(newPageSize !== pageSize ? 0 : newPageIndex);
              setPageSize(newPageSize);
            }}
            totalCount={totalCount}
          />
        </section>
      </main>
    </>
  );
};

export default DashboardPage;
