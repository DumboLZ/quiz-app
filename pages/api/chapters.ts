import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const dir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dir)) {
    return res.status(200).json([])
  }
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'))
  const chapters = files.map(file => {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))
    return {
      id: data.id,
      title: data.title,
      total: data.questions?.length || 0,
    }
  })
  res.status(200).json(chapters)
} 