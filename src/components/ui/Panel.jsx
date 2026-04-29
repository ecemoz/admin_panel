export function Panel({ title, action, children }) {
  return (
    <section className="panel-surface overflow-hidden">
      {(title || action) && (
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-heading text-lg font-semibold text-slate-900">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}
