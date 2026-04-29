import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Edit2, Plus, Trash2, X } from 'lucide-react'
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
import { getTopics } from '../../api/topicsApi'
import { Button } from '../../components/ui/Button'
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel } from '../../components/ui/Panel'
import { ErrorState, LoadingState } from '../../components/ui/TableStates'
import { getErrorMessage } from '../../lib/errors'
import { unwrapItem, unwrapList } from '../../lib/response'
import { clsx } from 'clsx'

// --- Schemas ---
const quizSchema = z.object({
  title: z.string().min(2, 'Başlık gerekli'),
  topicId: z.string().min(1, 'Konu gerekli'),
})

const questionSchema = z.object({
  questionText: z.string().min(3, 'Soru metni gerekli.'),
})

const optionSchema = z.object({
  optionText: z.string().min(1, 'Seçenek metni gerekli.'),
  isCorrect: z.boolean().default(false),
})

// --- Components ---

function QuizSettingsForm({ quiz, topicsData, id, invalidateQuiz }) {
  const quizForm = useForm({
    resolver: zodResolver(quizSchema),
    values: {
      title: quiz?.title || '',
      topicId: quiz?.topicId ?? '',
    },
  })

  const updateQuizMutation = useMutation({
    mutationFn: updateQuiz,
    onSuccess: () => {
      toast.success('Quiz ayarları kaydedildi.')
      invalidateQuiz()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <Panel title="Quiz Ayarları">
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={quizForm.handleSubmit((values) => updateQuizMutation.mutate({ id, payload: values }))}
      >
        <Input label="Başlık" error={quizForm.formState.errors.title?.message} {...quizForm.register('title')} />
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Konu</span>
          <select
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            {...quizForm.register('topicId')}
          >
            <option value="">Konu seçin...</option>
            {unwrapList(topicsData).map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
          {quizForm.formState.errors.topicId?.message ? (
            <p className="text-sm text-rose-600">{quizForm.formState.errors.topicId.message}</p>
          ) : null}
        </label>
        <div className="flex items-end justify-end md:col-span-2">
          <Button type="submit" disabled={updateQuizMutation.isPending}>
            {updateQuizMutation.isPending ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </Button>
        </div>
      </form>
    </Panel>
  )
}

function OptionItem({ option, questionId, onDelete, invalidateQuiz }) {
  const [isEditing, setIsEditing] = useState(false)

  const optionForm = useForm({
    resolver: zodResolver(optionSchema),
    values: { optionText: option.text || option.optionText || '', isCorrect: option.isCorrect || false },
  })

  const updateOptionMutation = useMutation({
    mutationFn: updateOption,
    onSuccess: () => {
      toast.success('Seçenek güncellendi.')
      setIsEditing(false)
      invalidateQuiz()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const handleToggleCorrect = () => {
    updateOptionMutation.mutate({
      optionId: option.id,
      payload: { optionText: option.text || option.optionText, isCorrect: !option.isCorrect },
    })
  }

  if (isEditing) {
    return (
      <form
        className="flex flex-col gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 sm:flex-row sm:items-center"
        onSubmit={optionForm.handleSubmit((values) =>
          updateOptionMutation.mutate({ optionId: option.id, payload: values })
        )}
      >
        <label className="flex items-center gap-2 px-1">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" {...optionForm.register('isCorrect')} />
          <span className="text-sm font-medium text-emerald-800">Doğru Mu?</span>
        </label>
        <input
          className="flex-1 rounded-md border border-emerald-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          {...optionForm.register('optionText')}
          autoFocus
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={updateOptionMutation.isPending}>
            <Check className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className={clsx(
      "group flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors sm:items-center",
      option.isCorrect ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white hover:border-slate-300"
    )}>
      <button 
        type="button"
        onClick={handleToggleCorrect}
        disabled={updateOptionMutation.isPending}
        className={clsx(
          "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors sm:mt-0",
          option.isCorrect ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-transparent hover:border-emerald-400"
        )}
      >
        <Check className="h-4 w-4" />
      </button>
      <span className={clsx("flex-1 text-sm", option.isCorrect ? "font-medium text-emerald-900" : "text-slate-700")}>
        {option.text || option.optionText}
      </span>
      <div className="flex opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
        <button type="button" onClick={() => setIsEditing(true)} className="p-1.5 text-slate-400 hover:text-emerald-600">
          <Edit2 className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => onDelete(option.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function NewOptionForm({ questionId, invalidateQuiz, onCancel }) {
  const optionForm = useForm({
    resolver: zodResolver(optionSchema),
    defaultValues: { optionText: '', isCorrect: false },
  })

  const createOptionMutation = useMutation({
    mutationFn: createOption,
    onSuccess: () => {
      toast.success('Seçenek eklendi.')
      optionForm.reset()
      onCancel()
      invalidateQuiz()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <form
      className="flex flex-col gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 sm:flex-row sm:items-center"
      onSubmit={optionForm.handleSubmit((values) =>
        createOptionMutation.mutate({ questionId, payload: values })
      )}
    >
      <label className="flex items-center gap-2 px-1">
        <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" {...optionForm.register('isCorrect')} />
        <span className="text-sm font-medium text-emerald-800">Doğru Mu?</span>
      </label>
      <input
        className="flex-1 rounded-md border border-emerald-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        placeholder="Seçenek metni..."
        {...optionForm.register('optionText')}
        autoFocus
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={createOptionMutation.isPending}>
          Ekle
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          İptal
        </Button>
      </div>
    </form>
  )
}

function QuestionCard({ index, question, onDelete, onDeleteOption, invalidateQuiz }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingOption, setIsAddingOption] = useState(false)

  const questionForm = useForm({
    resolver: zodResolver(questionSchema),
    values: { questionText: question.text || question.questionText || '' },
  })

  const updateQuestionMutation = useMutation({
    mutationFn: updateQuestion,
    onSuccess: () => {
      toast.success('Soru güncellendi.')
      setIsEditing(false)
      invalidateQuiz()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const options = unwrapList(question.options)

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
            {index + 1}
          </div>
          <span className="text-sm font-medium text-slate-500">Soru Detayı</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setIsEditing(!isEditing)} className="p-2 text-slate-400 hover:text-emerald-600">
            <Edit2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={onDelete} className="p-2 text-slate-400 hover:text-rose-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="p-5">
        {isEditing ? (
          <form
            className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start"
            onSubmit={questionForm.handleSubmit((values) =>
              updateQuestionMutation.mutate({ questionId: question.id, payload: values })
            )}
          >
            <div className="flex-1">
              <textarea
                className="w-full rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                rows={2}
                {...questionForm.register('questionText')}
                autoFocus
              />
            </div>
            <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
              <Button type="submit" disabled={updateQuestionMutation.isPending}>Kaydet</Button>
              <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>İptal</Button>
            </div>
          </form>
        ) : (
          <h4 className="mb-6 text-lg font-medium text-slate-900">{question.text || question.questionText}</h4>
        )}

        <div className="space-y-3">
          {options.map((option) => (
            <OptionItem
              key={option.id}
              option={option}
              questionId={question.id}
              onDelete={onDeleteOption}
              invalidateQuiz={invalidateQuiz}
            />
          ))}

          {isAddingOption ? (
            <NewOptionForm 
              questionId={question.id} 
              invalidateQuiz={invalidateQuiz} 
              onCancel={() => setIsAddingOption(false)} 
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingOption(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 transition-colors hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600"
            >
              <Plus className="h-4 w-4" /> Seçenek Ekle
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function NewQuestionForm({ quizId, invalidateQuiz }) {
  const [isOpen, setIsOpen] = useState(false)
  
  const questionForm = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: { questionText: '' },
  })

  const createQuestionMutation = useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      toast.success('Yeni soru oluşturuldu.')
      questionForm.reset()
      setIsOpen(false)
      invalidateQuiz()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50 py-6 text-emerald-600 transition hover:border-emerald-400 hover:bg-emerald-100/50"
      >
        <Plus className="h-5 w-5" />
        <span className="font-medium">Yeni Soru Ekle</span>
      </button>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm ring-1 ring-emerald-100">
      <div className="border-b border-emerald-100 bg-emerald-50/50 px-5 py-3">
        <h4 className="font-medium text-emerald-800">Yeni Soru</h4>
      </div>
      <form
        className="p-5"
        onSubmit={questionForm.handleSubmit((values) =>
          createQuestionMutation.mutate({ quizId, payload: values })
        )}
      >
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Soru Metni</span>
          <textarea
            rows={3}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            placeholder="Soru metnini buraya yazın..."
            {...questionForm.register('questionText')}
            autoFocus
          />
          {questionForm.formState.errors.questionText?.message && (
            <p className="text-sm text-rose-600">{questionForm.formState.errors.questionText.message}</p>
          )}
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>İptal</Button>
          <Button type="submit" disabled={createQuestionMutation.isPending}>
            Soru Ekle
          </Button>
        </div>
      </form>
    </div>
  )
}

export function QuizEditPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [selectedQuestionId, setSelectedQuestionId] = useState(null)
  const [selectedOptionId, setSelectedOptionId] = useState(null)

  const quizQuery = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => getQuizById(id),
  })

  const { data: topicsData } = useQuery({
    queryKey: ['topics'],
    queryFn: getTopics,
  })

  const quiz = unwrapItem(quizQuery.data)
  const questions = unwrapList(quiz?.questions)

  function invalidateQuiz() {
    queryClient.invalidateQueries({ queryKey: ['quiz', id] })
    queryClient.invalidateQueries({ queryKey: ['quizzes'] })
  }

  const deleteQuestionMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      toast.success('Soru silindi.')
      setSelectedQuestionId(null)
      invalidateQuiz()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const deleteOptionMutation = useMutation({
    mutationFn: deleteOption,
    onSuccess: () => {
      toast.success('Seçenek silindi.')
      setSelectedOptionId(null)
      invalidateQuiz()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="Quiz Oluşturucu" description="Soruları ve seçenekleri görsel bir şekilde yönetin." />

      {quizQuery.isLoading ? <LoadingState /> : null}
      {quizQuery.isError ? <ErrorState message="Quiz detayı alınamadı." /> : null}

      {!quizQuery.isLoading && !quizQuery.isError && quiz ? (
        <div className="mx-auto max-w-4xl space-y-8">
          <QuizSettingsForm quiz={quiz} topicsData={topicsData} id={id} invalidateQuiz={invalidateQuiz} />

          <div className="space-y-6">
            <h3 className="font-heading text-xl font-bold text-slate-900">Sorular</h3>
            
            {questions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                <h4 className="text-lg font-semibold text-slate-700">Henüz soru eklenmemiş</h4>
                <p className="mt-2 text-sm text-slate-500">Bu quize ilk soruyu ekleyerek başlayın.</p>
              </div>
            ) : (
              questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  index={index}
                  question={question}
                  onDelete={() => setSelectedQuestionId(question.id)}
                  onDeleteOption={(optionId) => setSelectedOptionId(optionId)}
                  invalidateQuiz={invalidateQuiz}
                />
              ))
            )}

            <NewQuestionForm quizId={id} invalidateQuiz={invalidateQuiz} />
          </div>
        </div>
      ) : null}

      <ConfirmModal
        open={Boolean(selectedQuestionId)}
        title="Soru silinsin mi?"
        message="Bu soruya ait tüm seçenekler kalıcı olarak silinecektir."
        loading={deleteQuestionMutation.isPending}
        onCancel={() => setSelectedQuestionId(null)}
        onConfirm={() => deleteQuestionMutation.mutate(selectedQuestionId)}
      />

      <ConfirmModal
        open={Boolean(selectedOptionId)}
        title="Seçenek silinsin mi?"
        message="Bu işlem geri alınamaz."
        loading={deleteOptionMutation.isPending}
        onCancel={() => setSelectedOptionId(null)}
        onConfirm={() => deleteOptionMutation.mutate(selectedOptionId)}
      />
    </div>
  )
}
