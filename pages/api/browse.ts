import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const relPath = (req.query.path as string) || ''
  const baseDir = path.join(process.cwd(), 'data', relPath)

  if (!fs.existsSync(baseDir)) {
    return res.status(404).json({ error: 'path not found' })
  }

  // 读取映射表
  const mapFile = path.join(process.cwd(), 'data', 'chapter_titles.json')
  let titleMap: Record<string, string> = {}
  if (fs.existsSync(mapFile)) {
    try {
      titleMap = JSON.parse(fs.readFileSync(mapFile, 'utf8'))
    } catch {}
  }

  const entries = fs.readdirSync(baseDir, { withFileTypes: true })

  const dirs = entries
    .filter((e) => e.isDirectory())
    .map((e) => ({ name: e.name, path: path.join(relPath, e.name) }))

  const chapterFiles = entries
    .filter(
      (e) =>
        e.isFile() && e.name.endsWith('.json') && e.name !== 'chapter_titles.json'
    )
    .map((e) => path.join(baseDir, e.name))

  const chapters = chapterFiles.map((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8')
    let id = 0
    let title = path.basename(filePath).replace(/\.json$/, '')
    let total = 0

    try {
      const data = JSON.parse(content)
      if (Array.isArray(data)) {
        if (data.length > 0 && typeof data[0].ChapterID !== 'undefined') {
          id = Number(data[0].ChapterID)
          title = `章节 ${id}`
        }
        total = data.length
      } else {
        id = data.id || 0
        title = data.title || title
        total = data.questions?.length || 0
      }
    } catch {}

    if (titleMap[id]) title = titleMap[id]

    return { id, title, total }
  })

  res.status(200).json({ dirs, chapters })
} 