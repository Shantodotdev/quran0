import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import {
  getSurahById,
  getVersesBySurah,
} from '#/data/quran/quran-data'

export const Route = createFileRoute('/surah/$surahId')({
  loader: ({ params }) => {
    const surahId = Number(params.surahId)
    const surah = getSurahById(surahId)

    if (!surah) {
      throw notFound()
    }

    return {
      surah,
      verses: getVersesBySurah(surahId),
    }
  },
  component: SurahPage,
})

function SurahPage() {
  const { surah, verses } = Route.useLoaderData()

  return (
    <main className="min-h-screen bg-stone-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-8">
        <header className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <Link to="/" className="text-sm font-medium text-emerald-700">
            Back to Quran Index
          </Link>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Surah {surah.id} · {surah.versesCount} ayahs
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-normal">
                {surah.nameSimple}
              </h1>
              <p className="mt-1 text-base text-slate-600">
                {surah.translatedNameBn}
              </p>
            </div>
            <p
              className="quran-arabic text-right text-4xl leading-tight text-slate-900"
              dir="rtl"
            >
              {surah.nameArabic}
            </p>
          </div>
        </header>

        <section className="grid gap-3">
          {verses.map((verse) => (
            <article
              key={verse.verseKey}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-600">
                  {verse.verseKey}
                </span>
              </div>
              <p
                className="quran-arabic mt-5 text-right text-[2.15rem] leading-loose text-slate-950"
                dir="rtl"
                lang="ar"
              >
                {verse.arabicIndopak}
              </p>
              <p className="mt-4 text-lg leading-8 text-slate-800">
                {verse.transliterationEn}
              </p>
              <p className="mt-3 text-base leading-8 text-slate-700" lang="bn">
                {verse.translationBnTaisirul}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
