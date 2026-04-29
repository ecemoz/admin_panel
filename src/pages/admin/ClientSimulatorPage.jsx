import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getLessons } from '../../api/lessonsApi'
import { getQuizzes, getQuizById } from '../../api/quizzesApi'
import { getTopics } from '../../api/topicsApi'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel } from '../../components/ui/Panel'
import { ErrorState, LoadingState } from '../../components/ui/TableStates'
import { unwrapItem, unwrapList } from '../../lib/response'
import { BookOpen, CheckCircle, ChevronRight, PlayCircle } from 'lucide-react'

function QuizSimulator({ quizId, onBack }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isFinished, setIsFinished] = useState(false)

  const quizQuery = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => getQuizById(quizId),
  })

  const quiz = unwrapItem(quizQuery.data)
  const questions = unwrapList(quiz?.questions)

  if (quizQuery.isLoading) return <LoadingState />
  if (quizQuery.isError) return <ErrorState message="Quiz yüklenemedi." />

  const handleSelectOption = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      setIsFinished(true)
    }
  }

  if (isFinished) {
    let score = 0
    questions.forEach((q) => {
      const selectedOptionId = answers[q.id]
      const selectedOption = unwrapList(q.options).find((opt) => opt.id === selectedOptionId)
      if (selectedOption?.isCorrect) {
        score++
      }
    })

    return (
      <Panel title="Quiz Sonucu">
        <div className="text-center py-12">
          <CheckCircle className="mx-auto h-16 w-16 text-emerald-500 mb-4" />
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Tebrikler!</h3>
          <p className="text-lg text-slate-600 mb-8">
            Skorunuz: <span className="font-bold text-emerald-600">{score}</span> / {questions.length}
          </p>
          <Button onClick={onBack}>Simülatöre Dön</Button>
        </div>
      </Panel>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  if (!currentQuestion) {
    return (
      <Panel title="Hata">
        <p className="text-slate-500">Bu quizde henüz soru yok.</p>
        <Button onClick={onBack} className="mt-4">Geri Dön</Button>
      </Panel>
    )
  }

  const options = unwrapList(currentQuestion.options)

  return (
    <Panel title={`${quiz?.title || 'Quiz'} - Soru ${currentQuestionIndex + 1}/${questions.length}`}>
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-slate-800">{currentQuestion.text || currentQuestion.questionText}</h3>
        <div className="space-y-3">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectOption(currentQuestion.id, option.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                answers[currentQuestion.id] === option.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              {option.text || option.optionText}
            </button>
          ))}
        </div>
        <div className="flex justify-between pt-6 border-t border-slate-100">
          <Button variant="secondary" onClick={onBack}>Çıkış</Button>
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Testi Bitir' : 'Sonraki Soru'}
          </Button>
        </div>
      </div>
    </Panel>
  )
}

function LessonSimulator({ lesson, onBack }) {
  return (
    <Panel title={lesson.title}>
      <div className="prose prose-slate max-w-none mb-8 whitespace-pre-wrap">
        {lesson.content}
      </div>
      <div className="flex justify-end pt-4 border-t border-slate-100">
        <Button onClick={onBack}>Dersten Çık</Button>
      </div>
    </Panel>
  )
}

export function ClientSimulatorPage() {
  const [selectedTopicId, setSelectedTopicId] = useState(null)
  const [activeLesson, setActiveLesson] = useState(null)
  const [activeQuizId, setActiveQuizId] = useState(null)

  const { data: topicsData, isLoading: topicsLoading } = useQuery({ queryKey: ['topics'], queryFn: getTopics })
  const { data: lessonsData } = useQuery({ queryKey: ['lessons'], queryFn: getLessons })
  const { data: quizzesData } = useQuery({ queryKey: ['quizzes'], queryFn: getQuizzes })

  const topics = unwrapList(topicsData)
  const lessons = unwrapList(lessonsData)
  const quizzes = unwrapList(quizzesData)

  if (activeQuizId) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto pb-12">
        <PageHeader title="Quiz Simülatörü" description="Kullanıcı deneyimi simülasyonu" />
        <QuizSimulator quizId={activeQuizId} onBack={() => setActiveQuizId(null)} />
      </div>
    )
  }

  if (activeLesson) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <PageHeader title="Ders Simülatörü" description="Kullanıcı deneyimi simülasyonu" />
        <LessonSimulator lesson={activeLesson} onBack={() => setActiveLesson(null)} />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="İstemci Simülatörü"
        description="Öğrencilerin sistemi nasıl gördüğünü, dersleri okuyup testleri nasıl çözdüklerini test edin."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-4">
          <Panel title="Konular">
            {topicsLoading ? <LoadingState /> : null}
            <div className="space-y-2">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border flex items-center justify-between transition-colors ${
                    selectedTopicId === topic.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-medium'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span>{topic.title}</span>
                  <ChevronRight className={`h-4 w-4 ${selectedTopicId === topic.id ? 'text-emerald-500' : 'text-slate-400'}`} />
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <div className="md:col-span-2 space-y-6">
          {selectedTopicId ? (
            <>
              <Panel title="İçerik Akışı">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Dersler</h3>
                    <div className="space-y-3">
                      {lessons
                        .filter((l) => l.topicId === selectedTopicId)
                        .map((lesson) => (
                          <div key={lesson.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white">
                            <div className="flex items-center gap-3">
                              <BookOpen className="h-5 w-5 text-slate-400" />
                              <span className="font-medium text-slate-700">{lesson.title}</span>
                            </div>
                            <Button size="sm" onClick={() => setActiveLesson(lesson)}>Okumaya Başla</Button>
                          </div>
                        ))}
                      {lessons.filter((l) => l.topicId === selectedTopicId).length === 0 && (
                        <p className="text-sm text-slate-500">Bu konuya ait ders bulunamadı.</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Quizler</h3>
                    <div className="space-y-3">
                      {quizzes
                        .filter((q) => q.topicId === selectedTopicId)
                        .map((quiz) => (
                          <div key={quiz.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white">
                            <div className="flex items-center gap-3">
                              <PlayCircle className="h-5 w-5 text-emerald-500" />
                              <div>
                                <span className="font-medium text-slate-700 block">{quiz.title}</span>
                                <span className="text-xs text-slate-500">{quiz.timeLimit} dakika</span>
                              </div>
                            </div>
                            <Button size="sm" onClick={() => setActiveQuizId(quiz.id)}>Quizi Başlat</Button>
                          </div>
                        ))}
                      {quizzes.filter((q) => q.topicId === selectedTopicId).length === 0 && (
                        <p className="text-sm text-slate-500">Bu konuya ait quiz bulunamadı.</p>
                      )}
                    </div>
                  </div>
                </div>
              </Panel>
            </>
          ) : (
            <div className="h-full min-h-[300px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <p className="text-slate-500">İçerikleri görmek için soldan bir konu seçin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
