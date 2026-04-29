import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { createQuiz, deleteQuiz, getQuizzes } from '../../api/quizzesApi'
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel } from '../../components/ui/Panel'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/TableStates'
import { getErrorMessage } from '../../lib/errors'
import { unwrapList } from '../../lib/response'

const quizSchema = z.object({
  title: z.string().min(2, 'Baslik en az 2 karakter olmali.'),
  description: z.string().min(5, 'Aciklama en az 5 karakter olmali.'),
  lessonId: z.coerce.number().int().positive('Lesson ID gerekli.'),
  timeLimit: z.coerce.number().int().positive('Sure pozitif olmali.'),
})

export function QuizzesPage() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState(null)

  const { data, isLoading, isError } = useQuery({ queryKey: ['quizzes'], queryFn: getQuizzes })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: '',
      description: '',
      lessonId: '',
      timeLimit: 10,
    },
  })

  const createMutation = useMutation({
    mutationFn: createQuiz,
    onSuccess: () => {
      toast.success('Quiz olusturuldu.')
      reset()
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },
    onError: () => toast.error('Quiz olusturulamadi.'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: () => {
      toast.success('Quiz silindi.')
      setSelectedId(null)
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const quizzes = unwrapList(data)

  return (
    <div className="space-y-6">
      <PageHeader title="Quizzes" description="Quiz kayitlarini ve bagli sorulari yonetin." />

      <Panel title="Yeni Quiz">
        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit((values) => createMutation.mutate(values))}>
          <Input label="Baslik" error={errors.title?.message} {...register('title')} />
          <Input label="Lesson ID" type="number" error={errors.lessonId?.message} {...register('lessonId')} />
          <label className="block space-y-1.5 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Aciklama</span>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              {...register('description')}
            />
            {errors.description?.message ? <p className="text-sm text-rose-600">{errors.description.message}</p> : null}
          </label>
          <Input label="Sure (dk)" type="number" error={errors.timeLimit?.message} {...register('timeLimit')} />
          <div className="flex items-end justify-end md:col-span-2">
            <Button type="submit" disabled={createMutation.isPending}>
              <Plus className="mr-2 h-4 w-4" /> {createMutation.isPending ? 'Ekleniyor...' : 'Quiz Ekle'}
            </Button>
          </div>
        </form>
      </Panel>

      {isLoading ? <LoadingState /> : null}
      {isError ? <ErrorState message="Quiz listesi alinamadi." /> : null}
      {!isLoading && !isError && quizzes.length === 0 ? <EmptyState title="Henuz quiz bulunmuyor." /> : null}

      {!isLoading && !isError && quizzes.length > 0 ? (
        <div className="panel-surface overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Baslik</th>
                <th className="px-4 py-3 font-semibold">Lesson ID</th>
                <th className="px-4 py-3 font-semibold">Sure</th>
                <th className="px-4 py-3 font-semibold text-right">Islem</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-600">{quiz.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{quiz.title}</td>
                  <td className="px-4 py-3 text-slate-600">{quiz.lessonId ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{quiz.timeLimit ?? '-'} dk</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/quizzes/${quiz.id}/edit`}>
                        <Button variant="secondary">
                          <Pencil className="mr-2 h-4 w-4" /> Duzenle
                        </Button>
                      </Link>
                      <Button variant="danger" onClick={() => setSelectedId(quiz.id)}>
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
        title="Quiz silinsin mi?"
        message="Quiz ile iliskili soru kayitlari da etkilenebilir."
        loading={deleteMutation.isPending}
        onCancel={() => setSelectedId(null)}
        onConfirm={() => deleteMutation.mutate(selectedId)}
      />
    </div>
  )
}
