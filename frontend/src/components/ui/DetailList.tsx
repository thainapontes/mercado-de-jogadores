import type { ReactNode } from 'react';

export interface Detail {
  label: string;
  value: ReactNode;
}

export function DetailList({ items }: { items: Detail[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex justify-between gap-4 border-b border-slate-100 py-1"
        >
          <dt className="text-slate-600">{item.label}</dt>
          <dd className="font-medium tabular-nums">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
