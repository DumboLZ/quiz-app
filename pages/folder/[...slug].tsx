import { useRouter } from 'next/router'
import Link from 'next/link'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Folder() {
  const router = useRouter()
  const slugArr = router.query.slug as string[] | undefined
  const relPath = slugArr ? slugArr.join('/') : ''

  const { data, error } = useSWR(`/api/browse${relPath ? `?path=${encodeURIComponent(relPath)}` : ''}`, fetcher)

  if (error) return <p className="p-4">加载失败</p>
  if (!data) return <p className="p-4">加载中…</p>

  const backLink = slugArr && slugArr.length > 0 ? `/folder/${slugArr.slice(0, -1).join('/')}` : null

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">{relPath || '全部学科'}</h1>
      {backLink && (
        <Link href={backLink || '/'} className="text-blue-600">← 返回上级</Link>
      )}
      <ul className="space-y-3">
        {data.dirs.map((d: any) => (
          <li key={d.path} className="border rounded p-4 flex justify-between">
            <span>{d.name}</span>
            <Link href={`/folder/${d.path}`} className="text-blue-600">进入 →</Link>
          </li>
        ))}
        {data.chapters.map((c: any) => (
          <li key={c.id} className="border rounded p-4 flex justify-between">
            <span>{c.title}（{c.total} 题）</span>
            <Link href={`/quiz/${c.id}`} className="text-blue-600">开始练习 →</Link>
          </li>
        ))}
      </ul>
    </main>
  )
} 