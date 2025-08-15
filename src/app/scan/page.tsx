'use client'
import Image from 'next/image'
import { useState } from 'react'
import Tesseract, { type LoggerMessage, type RecognizeResult } from 'tesseract.js'

type ImgData = { url: string; width: number; height: number }

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}

async function resizeToDataURLWithDims(dataURL: string, maxSize = 1280): Promise<ImgData> {
  const img = document.createElement('img')
  img.src = dataURL
  await new Promise<void>((resolve) => { img.onload = () => resolve() })
  const { width, height } = img
  const scale = Math.min(1, maxSize / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return { url: dataURL, width, height }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return { url: canvas.toDataURL('image/jpeg', 0.9), width: canvas.width, height: canvas.height }
}

export default function ScanPage() {
  const [img, setImg] = useState<ImgData | null>(null)
  const [text, setText] = useState<string>('')
  const [progress, setProgress] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setText('')
    setProgress(0)
    setLoading(true)

    try {
      const dataURL = await fileToDataURL(file)
      const resized = await resizeToDataURLWithDims(dataURL, 1280)
      setImg(resized)

      const result: RecognizeResult = await Tesseract.recognize(resized.url, 'eng', {
        logger: (m: LoggerMessage) => {
          if (m.status === 'recognizing text' && typeof m.progress === 'number') {
            setProgress(Math.round(m.progress * 100))
          }
        },
      })
      setText(result.data.text.trim())
    } catch (err: unknown) {
      let msg = 'OCR error'
      if (err instanceof Error) msg = err.message
      else if (typeof err === 'string') msg = err
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const onClear = () => {
    setImg(null)
    setText('')
    setError(null)
    setProgress(0)
  }

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Scan (OCR)</h1>

      <div className="flex items-center gap-3">
        <label className="block">
          <span className="sr-only">Choose an image</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFile}
            aria-label="Choose image to scan"
          />
        </label>

        <button
          type="button"
          onClick={onClear}
          className="px-3 py-2 rounded border hover:shadow focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
          disabled={!img && !text && !error && progress === 0}
        >
          Clear
        </button>
      </div>

      {img && (
        <div className="rounded-xl border overflow-hidden">
          <Image
            src={img.url}
            alt="Preview to OCR"
            width={img.width}
            height={img.height}
            className="h-auto w-full"
            unoptimized
          />
        </div>
      )}

      {loading && (
        <div aria-live="polite" className="space-y-1">
          <p>Recognizing text…</p>
          <div className="w-full h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-black rounded"
              style={{ width: `${progress}%`, transition: 'width .2s' }}
            />
          </div>
          <p className="text-sm opacity-70">{progress}%</p>
        </div>
      )}

      {error && <p role="alert" className="text-red-600">{error}</p>}

      {!!text && (
        <>
          <h2 className="font-semibold">Result</h2>
        <pre className="whitespace-pre-wrap p-3 rounded-xl border bg-white">{text}</pre>
        </>
      )}
    </main>
  )
}
