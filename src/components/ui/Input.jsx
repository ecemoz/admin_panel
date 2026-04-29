export function Input({ label, error, ...props }) {
  return (
    <label className="block space-y-1.5">
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
      <input
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        {...props}
      />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </label>
  )
}
