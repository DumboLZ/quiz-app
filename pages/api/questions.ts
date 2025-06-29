import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chapter } = req.query
  if (!chapter) return res.status(400).json({ error: 'chapter required' })

  const dir = path.join(process.cwd(), 'data')

  // 支持两种命名：chapter${id}.json  或 question_*_${id}.json
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.json') && f !== 'chapter_titles.json')
  const target = files.find(f =>
    f === `chapter${chapter}.json` || new RegExp(`question_.*_${chapter}\\.json`).test(f)
  )

  if (!target) return res.status(404).json({ error: 'not found' })

  const raw = fs.readFileSync(path.join(dir, target), 'utf8')
  const data = JSON.parse(raw)

  let title = `章节 ${chapter}`
  let questions: any[] = []

  // 读取章节标题映射
  const mapFile = path.join(dir, 'chapter_titles.json')
  let titleMap: Record<string, string> = {}
  if (fs.existsSync(mapFile)) {
    try {
      titleMap = JSON.parse(fs.readFileSync(mapFile, 'utf8'))
    } catch {}
  }

  if (Array.isArray(data)) {
    // 新格式
    questions = data.map((item: any) => {
      const q = JSON.parse(item.QuestionJson)
      const opts = q.Option.map((o: any) => o.content)
      const answerIdx = q.Option.findIndex((o: any) => String(o.truefalse) === 'true')
      return {
        id: item.ID,
        title: q.Stem,
        options: opts,
        answer: answerIdx,
      }
    })
  } else {
    title = data.title || title
    questions = data.questions || []
  }

  // 覆盖映射表中的标题
  if (titleMap[chapter as string]) {
    title = titleMap[chapter as string]
  }

  res.status(200).json({ title, questions })
} 