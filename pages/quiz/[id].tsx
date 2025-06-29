import { useRouter } from 'next/router'
import useSWR from 'swr'
import { useState } from 'react'
import React from 'react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Quiz() {
  const router = useRouter()
  const { id } = router.query
  const { data, error } = useSWR(id ? `/api/questions?chapter=${id}` : null, fetcher)

  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [current, setCurrent] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [finished, setFinished] = useState(false)

  if (error) return <p className="p-4">加载失败</p>
  if (!data) return <p className="p-4">加载中…</p>

  const { title, questions } = data

  const handleSelect = (qid: number, idx: number) => setAnswers({ ...answers, [qid]: idx })

  const handleSubmit = () => {
    setSubmitted(true)
  }

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1)
      setSubmitted(false)
    } else {
      setFinished(true)
    }
  }

  const score = Object.keys(answers).filter((qid) => {
    const q = questions.find((qq: any) => qq.id === Number(qid))
    return q && answers[q.id] === q.answer
  }).length

  React.useEffect(() => {
    if (!submitted || finished) return
    const q = questions[current]
    if (q && answers[q.id] === q.answer) {
      const t = setTimeout(handleNext, 1000)
      return () => clearTimeout(t)
    }
  }, [submitted, current, finished])

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">{title}</h1>
      {!finished && (
        <>
          {(() => {
            const q = questions[current]
            return (
              <div key={q.id} className="border rounded p-4 space-y-2">
                <p>{current + 1}. {q.title}</p>
                {q.options.map((opt: string, oi: number) => {
                  const checked = answers[q.id] === oi
                  const isCorrect = submitted && oi === q.answer
                  const isWrong = submitted && checked && oi !== q.answer
                  return (
                    <label key={oi} className={`block p-2 rounded cursor-pointer ${checked ? 'bg-blue-100' : ''} ${isCorrect ? 'bg-green-200' : ''} ${isWrong ? 'bg-red-200' : ''}`}>
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        className="mr-2"
                        checked={checked}
                        disabled={submitted}
                        onChange={() => handleSelect(q.id, oi)}
                      />
                      {opt}
                    </label>
                  )
                })}
                {submitted && (
                  <p className={`text-sm ${answers[q.id] === q.answer ? 'text-green-600' : 'text-red-600'}`}>
                    {answers[q.id] === q.answer ? '回答正确' : `回答错误，正确答案：${q.options[q.answer]}`}
                  </p>
                )}
              </div>
            )
          })()}

          {!submitted && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded mt-4"
              disabled={questions.length === 0 || answers[questions[current].id] === undefined}
              onClick={handleSubmit}
            >提交</button>
          )}

          {submitted && answers[questions[current].id] !== questions[current].answer && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded mt-4" onClick={handleNext}>下一题</button>
          )}
        </>
      )}

      {finished && (
        <div className="text-center text-lg font-bold">练习结束！得分：{score} / {questions.length}</div>
      )}
    </main>
  )
} 