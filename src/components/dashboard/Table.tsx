import React from "react";
import { TableDataItem, TableColumn, TableAction } from "@/types";

interface DataTableProps<T extends TableDataItem> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  title?: string;
  emptyMessage?: string;
  rowOnClick?: (item: T) => void;
}

function Table<T extends TableDataItem>({
  data,
  columns,
  actions,
  title,
  emptyMessage = "Nu există date de afișat.",
  rowOnClick,
}: DataTableProps<T>) {
  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden">
      {title && (
        <h2 className="text-2xl font-semibold text-gray-800 p-6 border-b border-gray-200">
          {title}
        </h2>
      )}

      {data.length === 0 ? (
        <div className="p-6 text-center text-gray-500">{emptyMessage}</div>
      ) : (
        <div className="overflow-x-auto">
          {" "}
          {/* Permite scroll orizontal pentru tabele mari */}
          <table className="min-w-full text-left table-auto">
            <thead className="bg-gray-50 uppercase text-gray-700 text-sm leading-normal">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key as string} // Folosim `as string` pentru keyof T
                    className={`py-3 px-6 font-semibold ${
                      column.align ? `text-${column.align}` : "text-left"
                    }`}
                  >
                    {column.header}
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th className="py-3 px-6 text-center font-semibold">
                    Acțiuni
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light divide-y divide-gray-200">
              {data.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className={`hover:bg-blue-50 transition-colors duration-150 ease-in-out ${
                    rowOnClick
                      ? "cursor-pointer"
                      : ""
                  }`}
                  onClick={rowOnClick ? () => rowOnClick(item) : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={`${item.id}-${column.key as string}`}
                      className={`py-3 px-6 whitespace-nowrap ${
                        column.align ? `text-${column.align}` : "text-left"
                      }`}
                    >
                      {/* Dacă există o funcție `render`, o folosim. Altfel, afișăm valoarea direct. */}
                      {column.render
                        ? column.render(item)
                        : String(item[column.key as keyof T] ?? "")}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="py-3 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {actions.map((action, index) => (
                          <button
                            key={`${item.id}-action-${index}`}
                            onClick={() => action.onClick(item)}
                            className={`
                                py-1 px-3 rounded-lg text-xs transition-colors duration-200
                                ${
                                  action.className ||
                                  "bg-blue-500 hover:bg-blue-600 text-white"
                                }
                              `}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Table;
