import { ReactNode } from 'react';

export type Column<T> = {
    header: string;
    render: (row: T) => ReactNode;
    headerClassName?: string;
    cellClassName?: string;
};

export default function Table<T>({
    data,
    columns,
    emptyMessage = 'No items found.',
}: {
    data: T[];
    columns: Column<T>[];
    emptyMessage?: string;
}) {
    return (
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0d1322]/80 backdrop-blur-xl shadow-specular">
            <table className="min-w-full divide-y divide-white/[0.06]">
                <thead className="bg-white/[0.02]">
                    <tr>
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className={`px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-400 ${col.headerClassName ?? ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="transition-colors duration-150 hover:bg-white/[0.03]">
                            {columns.map((col, colIndex) => (
                                <td
                                    key={colIndex}
                                    className={`whitespace-nowrap px-5 py-4 text-sm text-zinc-300 ${col.cellClassName ?? ''}`}
                                >
                                    {col.render(row)}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-5 py-12 text-center text-sm text-zinc-500 font-medium"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

