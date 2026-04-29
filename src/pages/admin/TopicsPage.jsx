import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { deleteTopic, getTopics } from '../../api/topicsApi'
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import { Button } from '../../components/ui/Button'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/TableStates'
import { PageHeader } from '../../components/ui/PageHeader'
import { getErrorMessage } from '../../lib/errors'
import { unwrapList } from '../../lib/response'

export function TopicsPage() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState(null)

  const { data, isLoading, isError } = useQuery({ queryKey: ['topics'], queryFn: getTopics })

  const deleteMutation = useMutation({
    mutationFn: deleteTopic,
    onSuccess: () => {
      toast.success('Topic silindi.')
      queryClient.invalidateQueries({ queryKey: ['topics'] })
      setSelectedId(null)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const topics = unwrapList(data)

  return (
    <div>
      <PageHeader
        title="Topics"
        description="Mobil uygulamada gorunen konu basliklarini yonetin."
        action={
          <Link to="/admin/topics/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Yeni Topic
            </Button>
          </Link>
        }
      />

      {isLoading ? <LoadingState /> : null}
      {isError ? <ErrorState message="Topic listesi alinamadi." /> : null}
      {!isLoading && !isError && topics.length === 0 ? <EmptyState title="Henuz topic eklenmemis." /> : null}

      {!isLoading && !isError && topics.length > 0 ? (
        <div className="panel-surface overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Baslik</th>
                <th className="px-4 py-3 font-semibold">Sira</th>
                <th className="px-4 py-3 font-semibold text-right">Islem</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <tr key={topic.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-600">{topic.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{topic.title}</td>
                  <td className="px-4 py-3 text-slate-600">{topic.order ?? '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/topics/${topic.id}/edit`}>
                        <Button variant="secondary">
                          <Pencil className="mr-2 h-4 w-4" /> Duzenle
                        </Button>
                      </Link>
                      <Button variant="danger" onClick={() => setSelectedId(topic.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Sil
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <ConfirmModal
        open={Boolean(selectedId)}
        title="Topic silinsin mi?"
        message="Bu islem geri alinamaz."
        loading={deleteMutation.isPending}
        onCancel={() => setSelectedId(null)}
        onConfirm={() => deleteMutation.mutate(selectedId)}
      />
    </div>
  )
}
