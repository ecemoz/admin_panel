export function LoadingState() {
  return <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">Yukleniyor...</div>
}

export function ErrorState({ message = 'Beklenmeyen bir hata olustu.' }) {
  return <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{message}</div>
}

export function EmptyState({ title = 'Kayit bulunamadi.' }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">{title}</div>
}
