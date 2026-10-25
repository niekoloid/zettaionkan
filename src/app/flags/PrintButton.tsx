'use client'

export default function PrintButton() {
  return (
    <button className="btn-primary mt-4" onClick={() => window.print()}>
      印刷する
    </button>
  )
}
