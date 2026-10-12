import type { ReactNode } from 'react'

/** Page heading used by every parent-facing screen so titles line up across the app */
export default function PageTitle({ title, lead, right }: { title: ReactNode; lead?: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-black text-gray-900">{title}</h1>
        {lead && <p className="mt-1 text-sm text-gray-500">{lead}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  )
}
