import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { getSurahById, getVersesBySurah } from '#/data/quran/quran-data'

export const Route = createFileRoute('/surah/$surahId')({
  loader: ({ params }) => {
    const surahId = parseSurahId(params.surahId)
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

function parseSurahId(value: string) {
  const surahId = Number(value)

  if (!Number.isInteger(surahId) || surahId < 1 || surahId > 114) {
    throw notFound()
  }

  return surahId
}

function SurahPage() {
  const { surah, verses } = Route.useLoaderData()

  return (
    <>
      <header className="rounded-lg border border-(--app-border) bg-(--app-surface) p-4 shadow-sm">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-emerald-400 transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>All Surahs</span>
        </Link>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Surah {surah.id} · {surah.versesCount} Ayahs
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-100">
              {surah.nameSimple}
            </h1>
            <p className="mt-0.5 text-base text-slate-300" lang="bn">
              {surah.banglaName}
            </p>
            <p className="mt-0.5 text-sm text-slate-500" lang="bn">
              {surah.translatedNameBn}
            </p>
          </div>
          <p
            className="quran-arabic shrink-0 text-right text-3xl leading-tight text-slate-100"
            dir="rtl"
          >
            {surah.nameArabic}
          </p>
        </div>
      </header>

      <section className="grid gap-3">
        {verses.map((verse) => (
          <article key={verse.verseKey} className="p-3">
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-md bg-(--app-surface-raised) px-2 py-1 text-sm font-semibold text-slate-300">
                {verse.verseKey}
              </span>
            </div>
            <p
              className="quran-arabic mt-5 text-right text-[1.75rem] leading-relaxed text-slate-50"
              dir="rtl"
              lang="ar"
            >
              {verse.arabicIndopak}
            </p>
            <p className="mt-4 text-base leading-7 text-slate-200">
              {verse.transliterationEn}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-400" lang="bn">
              {verse.translationBnTaisirul}
            </p>
          </article>
        ))}
      </section>
    </>
  )
}
