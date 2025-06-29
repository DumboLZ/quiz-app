import Link from 'next/link'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Home() {
  const { data, error } = useSWR('/api/chapters', fetcher)

  if (error) return <p className="p-4">加载失败</p>
  if (!data) return <p className="p-4">加载中…</p>

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">章节列表</h1>
      <ul className="space-y-3">
        {data.map((c: any) => (
          <li key={c.id} className="border rounded p-4 flex justify-between">
            <span>{c.title}（{c.total} 题）</span>
            <Link href={`/quiz/${c.id}`} className="text-blue-600">开始练习 →</Link>
          </li>
        ))}
      </ul>
    </main>
  )
} 