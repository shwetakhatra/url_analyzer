import React, { useMemo } from "react";
import { Header } from "../components/layout/Header";
import { useNavigate } from "react-router-dom";
import { ChartCard } from "../components/ui/chart/ChartCard";
import { useLocation } from "react-router-dom";
import { Table } from "../components/ui/table/Table";
import type { ColumnDef } from "@tanstack/react-table";

interface BrokenLinkRecord {
  link: string;
  status: number | string;
}

const DetailViewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const brokenLinks: BrokenLinkRecord[] =
    (location.state && location.state.brokenLinks) || [];

  const [pageIndex, setPageIndex] = React.useState<number>(0);
  const totalCount = brokenLinks.length;
  const internalLinks = location.state?.internalLinks ?? 0;
  const externalLinks = location.state?.externalLinks ?? 0;
  console.log("BrokenLinksDetail:", brokenLinks);
  const loading = false;

  const columns = useMemo<ColumnDef<BrokenLinkRecord, any>[]>(
    () => [
      {
        id: "rowNumber",
        header: "#",
        cell: ({ row }) => row.index + 1,
        size: 50,
      },
      {
        accessorKey: "link",
        header: "Link",
        cell: (info) => (
          <a
            href={info.getValue() as string}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-blue-600 hover:underline"
          >
            {info.getValue() as string}
          </a>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => info.getValue(),
      },
    ],
    [],
  );

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto min-h-screen flex items-start mt-10 p-4 sm:p-6">
        <div className="bg-white rounded-xl shadow p-6 w-full flex flex-col">
          <div className="flex items-center mb-6">
            <button
              className="text-gray-600 hover:text-blue-600 focus:outline-none mr-4 flex items-center gap-2"
              onClick={() => navigate(-1)}
              aria-label="Back"
            >
              <i className="fa fa-arrow-left text-xl" aria-hidden="true"></i>
              <span className="font-medium text-base">Back</span>
            </button>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2 w-full flex items-center justify-center">
              <ChartCard internalLinks={internalLinks} externalLinks={externalLinks} />
            </div>
            <div className="md:w-1/2 w-full">
              <div className="bg-gray-50 rounded-xl shadow p-6 h-full min-h-[350px] flex flex-col">
                <h3 className="text-lg font-semibold mb-4">Broken Links</h3>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <Table
                    data={brokenLinks}
                    columns={columns}
                    emptyMessage="No broken links found."
                    enablePagination={true}
                    pagination={{ pageIndex, pageSize: 5 }}
                    onPaginationChange={(updater) => {
                      const { pageIndex: newPageIndex } =
                        typeof updater === "function"
                          ? updater({ pageIndex, pageSize: 5 })
                          : updater;
                      setPageIndex(newPageIndex);
                    }}
                    totalCount={totalCount}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { DetailViewPage };
