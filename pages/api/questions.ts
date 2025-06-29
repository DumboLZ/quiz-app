import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chapter } = req.query
  if (!chapter) return res.status(400).json({ error: 'chapter required' })

  const file = path.join(process.cwd(), 'data', `chapter${chapter}.json`)
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'not found' })

  const { title, questions } = JSON.parse(fs.readFileSync(file, 'utf8'))
  res.status(200).json({ title, questions })
} 