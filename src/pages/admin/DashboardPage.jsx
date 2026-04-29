import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from '../../api/dashboardApi'
import { PageHeader } from '../../components/ui/PageHeader'
import { ErrorState, LoadingState } from '../../components/ui/TableStates'
import { unwrapItem } from '../../lib/response'

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
  })

  const summary = unwrapItem(data)

  return (
    <div>
      <PageHeader title="Dashboard" description="Sistem ozetini ve temel metrikleri izleyin." />

      {isLoading ? <LoadingState /> : null}
      {isError ? <ErrorState message="Dashboard verileri alinamadi." /> : null}

      {!isLoading && !isError ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Toplam Topic" value={summary?.topicCount ?? summary?.topics ?? 0} />
          <MetricCard title="Toplam Lesson" value={summary?.lessonCount ?? summary?.lessons ?? 0} />
          <MetricCard title="Toplam Quiz" value={summary?.quizCount ?? summary?.quizzes ?? 0} />
          <MetricCard title="Toplam User" value={summary?.userCount ?? summary?.users ?? 0} />
        </div>
      ) : null}
    </div>
  )
}

function MetricCard({ title, value }) {
  return (
    <article className="panel-surface p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-3 font-heading text-3xl font-bold text-slate-900">{value}</p>
    </article>
  )
}
