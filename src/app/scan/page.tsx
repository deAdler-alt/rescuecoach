'use client'
import { useState } from 'react'
import Tesseract from 'tesseract.js'

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}

async function resizeDataURL(dataURL: string, maxSize = 1280): Promise<string> {
  const img = document.createElement('img')
  img.src = dataURL
  await new Promise((r) => (img.onload = () => r(null)))
  const { width, height } = img
  const scale = Math.min(1, maxSize / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.9)
}

export default function ScanPage() {
  const [img, setImg] = useState<string | null>(null)
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
      const resized = await resizeDataURL(dataURL, 1280)
      setImg(resized)

      const result = await Tesseract.recognize(resized, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text' && typeof m.progress === 'number') {
            setProgress(Math.round(m.progress * 100))
          }
        },
      })

      setText(result.data.text.trim())
    } catch (err: any) {
      setError(err?.message || 'Błąd OCR')
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
      <h1 className="text-2xl font-bold">Skanuj lek (OCR)</h1>

      <div className="flex items-center gap-3">
        <label className="block">
          <span className="sr-only">Wybierz zdjęcie opakowania</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFile}
            aria-label="Wybierz zdjęcie opakowania"
          />
        </label>

        <button
          type="button"
          onClick={onClear}
          className="px-3 py-2 rounded border hover:shadow focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
          disabled={!img && !text && !error && progress === 0}
        >
          Wyczyść
        </button>
      </div>

      {img && <img src={img} alt="Podgląd zdjęcia do OCR" className="rounded-xl border" />}

      {loading && (
        <div aria-live="polite" className="space-y-1">
          <p>Rozpoznaję tekst…</p>
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
          <h2 className="font-semibold">Wynik</h2>
          <pre className="whitespace-pre-wrap p-3 rounded-xl border bg-white">{text}</pre>
        </>
      )}
    </main>
  )
}
