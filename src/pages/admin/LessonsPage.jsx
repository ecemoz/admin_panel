import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { deleteLesson, getLessons } from '../../api/lessonsApi'
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import { Button } from '../../components/ui/Button'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/TableStates'
import { PageHeader } from '../../components/ui/PageHeader'
import { unwrapList } from '../../lib/response'

export function LessonsPage() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState(null)

  const { data, isLoading, isError } = useQuery({ queryKey: ['lessons'], queryFn: getLessons })

  const deleteMutation = useMutation({
    mutationFn: deleteLesson,
    onSuccess: () => {
      toast.success('Lesson silindi.')
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      setSelectedId(null)
    },
    onError: () => toast.error('Lesson silinemedi.'),
  })

  const lessons = unwrapList(data)

  return (
    <div>
      <PageHeader
        title="Lessons"
        description="Ders iceriklerini yonetin."
        action={
          <Link to="/admin/lessons/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Yeni Lesson
            </Button>
          </Link>
        }
      />

      {isLoading ? <LoadingState /> : null}
      {isError ? <ErrorState message="Lesson listesi alinamadi." /> : null}
      {!isLoading && !isError && lessons.length === 0 ? <EmptyState title="Henuz lesson eklenmemis." /> : null}

      {!isLoading && !isError && lessons.length > 0 ? (
        <div className="panel-surface overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Baslik</th>
                <th className="px-4 py-3 font-semibold">Topic ID</th>
                <th className="px-4 py-3 font-semibold">Sira</th>
                <th className="px-4 py-3 font-semibold text-right">Islem</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-600">{lesson.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{lesson.title}</td>
                  <td className="px-4 py-3 text-slate-600">{lesson.topicId ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{lesson.order ?? '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/lessons/${lesson.id}/edit`}>
                        <Button variant="secondary">
                          <Pencil className="mr-2 h-4 w-4" /> Duzenle
                        </Button>
                      </Link>
                      <Button variant="danger" onClick={() => setSelectedId(lesson.id)}>
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
        title="Lesson silinsin mi?"
        message="Bu islem geri alinamaz."
        loading={deleteMutation.isPending}
        onCancel={() => setSelectedId(null)}
        onConfirm={() => deleteMutation.mutate(selectedId)}
      />
    </div>
  )
}
