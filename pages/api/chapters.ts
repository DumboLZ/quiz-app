import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const dir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dir)) {
    return res.status(200).json([])
  }

  // 递归收集所有 json 题库文件（排除 chapter_titles.json）
  const collectFiles = (d: string): string[] => {
    const list: string[] = []
    fs.readdirSync(d, { withFileTypes: true }).forEach(ent => {
      const full = path.join(d, ent.name)
      if (ent.isDirectory()) {
        list.push(...collectFiles(full))
      } else if (ent.isFile() && ent.name.endsWith('.json') && ent.name !== 'chapter_titles.json') {
        list.push(full)
      }
    })
    return list
  }

  const files = collectFiles(dir)

  // 允许用户在 data/chapter_titles.json 中自定义章节名称映射 { "35048": "消化系统基础" }
  let titleMap: Record<string, string> = {}
  const mapFile = path.join(dir, 'chapter_titles.json')
  if (fs.existsSync(mapFile)) {
    try {
      titleMap = JSON.parse(fs.readFileSync(mapFile, 'utf8'))
    } catch {}
  }

  const chapters = files.map(file => {
    const content = fs.readFileSync(file, 'utf8')

    let id = 0
    let title = file.replace(/\.json$/, '')
    let total = 0

    try {
      const data = JSON.parse(content)

      if (Array.isArray(data)) {
        // 新题库格式：数组，每题带 QuestionJson
        if (data.length > 0) {
          const first = data[0]
          if (first && typeof first.ChapterID !== 'undefined') {
            id = Number(first.ChapterID)
            title = `章节 ${id}`
          }
        }
        total = data.length
      } else {
        // 旧格式：{ id, title, questions }
        id = data.id || 0
        title = data.title || title
        total = data.questions?.length || 0
      }
    } catch (e) {
      // ignore parse errors for mis-formatted file
    }

    // 使用映射表覆盖标题（若存在）
    if (titleMap[id]) {
      title = titleMap[id]
    }

    return { id, title, total }
  })
  res.status(200).json(chapters)
} 