import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import { z } from 'zod'
import {
  createOption,
  createQuestion,
  deleteOption,
  deleteQuestion,
  getQuizById,
  updateOption,
  updateQuestion,
  updateQuiz,
} from '../../api/quizzesApi'
import { Button } from '../../components/ui/Button'
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel } from '../../components/ui/Panel'
import { ErrorState, LoadingState } from '../../components/ui/TableStates'
import { getErrorMessage } from '../../lib/errors'
import { unwrapItem, unwrapList } from '../../lib/response'

const quizSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  lessonId: z.coerce.number().int().positive(),
  timeLimit: z.coerce.number().int().positive(),
})

const questionSchema = z.object({
  text: z.string().min(5, 'Soru metni gerekli.'),
  points: z.coerce.number().int().positive('Puan pozitif olmali.'),
})

const optionSchema = z.object({
  text: z.string().min(1, 'Secenek metni gerekli.'),
  isCorrect: z.boolean().default(false),
})

export function QuizEditPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [selectedQuestionId, setSelectedQuestionId] = useState(null)
  const [selectedOptionId, setSelectedOptionId] = useState(null)

  const quizQuery = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => getQuizById(id),
  })

  const quiz = unwrapItem(quizQuery.data)
  const questions = unwrapList(quiz?.questions)

  const quizForm = useForm({
    resolver: zodResolver(quizSchema),
    values: {
      title: quiz?.title || '',
      description: quiz?.description || '',
      lessonId: quiz?.lessonId ?? 0,
      timeLimit: quiz?.timeLimit ?? 10,
    },
  })

  const questionForm = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: { text: '', points: 10 },
  })

  const optionForm = useForm({
    resolver: zodResolver(optionSchema),
    defaultValues: { text: '', isCorrect: false },
  })

  function invalidateQuiz() {
    queryClient.invalidateQueries({ queryKey: ['quiz', id] })
    queryClient.invalidateQueries({ queryKey: ['quizzes'] })
  }

  const updateQuizMutation = useMutation({
    mutationFn: updateQuiz,
    onSuccess: () => {
      toast.success('Quiz guncellendi.')
      invalidateQuiz()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const createQuestionMutation = useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      toast.success('Soru eklendi.')
      questionForm.reset({ text: '', points: 10 })
      invalidateQuiz()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const updateQuestionMutation = useMutation({
    mutationFn: updateQuestion,
    onSuccess: () => {
      toast.success('Soru guncellendi.')
      invalidateQuiz()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const deleteQuestionMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      toast.success('Soru silindi.')
      setSelectedQuestionId(null)
      invalidateQuiz()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const createOptionMutation = useMutation({
    mutationFn: createOption,
    onSuccess: () => {
      toast.success('Secenek eklendi.')
      optionForm.reset({ text: '', isCorrect: false })
      invalidateQuiz()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const updateOptionMutation = useMutation({
    mutationFn: updateOption,
    onSuccess: () => {
      toast.success('Secenek guncellendi.')
      invalidateQuiz()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const deleteOptionMutation = useMutation({
    mutationFn: deleteOption,
    onSuccess: () => {
      toast.success('Secenek silindi.')
      setSelectedOptionId(null)
      invalidateQuiz()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Quiz Duzenle" description="Quiz bilgisi, sorular ve secenekleri yonetin." />

      {quizQuery.isLoading ? <LoadingState /> : null}
      {quizQuery.isError ? <ErrorState message="Quiz detayi alinamadi." /> : null}

      {!quizQuery.isLoading && !quizQuery.isError && quiz ? (
        <>
          <Panel title="Quiz Bilgileri">
            <form
              className="grid gap-3 md:grid-cols-2"
              onSubmit={quizForm.handleSubmit((values) => updateQuizMutation.mutate({ id, payload: values }))}
            >
              <Input label="Baslik" error={quizForm.formState.errors.title?.message} {...quizForm.register('title')} />
              <Input
                label="Lesson ID"
                type="number"
                error={quizForm.formState.errors.lessonId?.message}
                {...quizForm.register('lessonId')}
              />
              <label className="block space-y-1.5 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Aciklama</span>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  {...quizForm.register('description')}
                />
              </label>
              <Input
                label="Sure (dk)"
                type="number"
                error={quizForm.formState.errors.timeLimit?.message}
                {...quizForm.register('timeLimit')}
              />
              <div className="flex items-end justify-end md:col-span-2">
                <Button type="submit" disabled={updateQuizMutation.isPending}>
                  {updateQuizMutation.isPending ? 'Kaydediliyor...' : 'Quiz Guncelle'}
                </Button>
              </div>
            </form>
          </Panel>

          <Panel title="Yeni Soru">
            <form
              className="grid gap-3 md:grid-cols-[1fr_120px_auto]"
              onSubmit={questionForm.handleSubmit((values) =>
                createQuestionMutation.mutate({ quizId: id, payload: values })
              )}
            >
              <Input label="Soru" error={questionForm.formState.errors.text?.message} {...questionForm.register('text')} />
              <Input
                label="Puan"
                type="number"
                error={questionForm.formState.errors.points?.message}
                {...questionForm.register('points')}
              />
              <div className="flex items-end">
                <Button type="submit" disabled={createQuestionMutation.isPending}>
                  <Plus className="mr-2 h-4 w-4" /> Ekle
                </Button>
              </div>
            </form>
          </Panel>

          <div className="space-y-4">
            {questions.map((question) => (
              <Panel key={question.id} title={`Soru #${question.id}`}>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-900">{question.text}</p>
                  <p className="mt-1 text-xs text-slate-500">Puan: {question.points}</p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const text = window.prompt('Soru metni', question.text)
                        if (!text) return
                        updateQuestionMutation.mutate({ questionId: question.id, payload: { text, points: question.points } })
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Soru Duzenle
                    </Button>
                    <Button variant="danger" onClick={() => setSelectedQuestionId(question.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Soru Sil
                    </Button>
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-slate-600">
                      <tr>
                        <th className="py-2 font-semibold">Secenek</th>
                        <th className="py-2 font-semibold">Dogru</th>
                        <th className="py-2 text-right font-semibold">Islem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unwrapList(question.options).map((option) => (
                        <tr key={option.id} className="border-t border-slate-100">
                          <td className="py-2">{option.text}</td>
                          <td className="py-2">{option.isCorrect ? 'Evet' : 'Hayir'}</td>
                          <td className="py-2">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="secondary"
                                onClick={() => {
                                  const text = window.prompt('Secenek metni', option.text)
                                  if (!text) return
                                  updateOptionMutation.mutate({
                                    optionId: option.id,
                                    payload: { text, isCorrect: option.isCorrect },
                                  })
                                }}
                              >
                                Duzenle
                              </Button>
                              <Button variant="danger" onClick={() => setSelectedOptionId(option.id)}>
                                Sil
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <form
                  className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]"
                  onSubmit={optionForm.handleSubmit((values) =>
                    createOptionMutation.mutate({ questionId: question.id, payload: values })
                  )}
                >
                  <Input label="Yeni Secenek" error={optionForm.formState.errors.text?.message} {...optionForm.register('text')} />
                  <label className="mt-7 inline-flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" {...optionForm.register('isCorrect')} /> Dogru
                  </label>
                  <div className="mt-5">
                    <Button type="submit" disabled={createOptionMutation.isPending}>
                      Ekle
                    </Button>
                  </div>
                </form>
              </Panel>
            ))}
          </div>
        </>
      ) : null}

      <ConfirmModal
        open={Boolean(selectedQuestionId)}
        title="Soru silinsin mi?"
        message="Bu soruya ait secenekler de silinebilir."
        loading={deleteQuestionMutation.isPending}
        onCancel={() => setSelectedQuestionId(null)}
        onConfirm={() => deleteQuestionMutation.mutate(selectedQuestionId)}
      />

      <ConfirmModal
        open={Boolean(selectedOptionId)}
        title="Secenek silinsin mi?"
        message="Bu islem geri alinamaz."
        loading={deleteOptionMutation.isPending}
        onCancel={() => setSelectedOptionId(null)}
        onConfirm={() => deleteOptionMutation.mutate(selectedOptionId)}
      />
    </div>
  )
}
