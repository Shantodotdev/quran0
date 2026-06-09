import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const resourcesDir = path.join(rootDir, 'resources')
const outputDir = path.join(rootDir, 'src', 'data', 'quran', 'generated')
const surahOutputDir = path.join(outputDir, 'surahs')

const learningOrder = [
  1, 112, 108, 114, 113, 103, 106, 110, 105, 111, 109, 107, 97, 94, 102, 95,
  99, 104, 101, 93, 100, 91, 86, 87, 96, 92, 82, 90, 98, 88, 85, 84, 81, 89,
  80, 83, 75, 77, 78, 62, 73, 63, 79, 71, 76, 70, 61, 64, 72, 69, 66, 74, 68,
  55, 52, 67, 54, 65, 32, 50, 44, 49, 51, 53, 60, 59, 56, 45, 58, 47, 31, 48,
  57, 46, 15, 36, 38, 41, 35, 30, 14, 43, 13, 42, 34, 25, 29, 19, 37, 23, 27,
  39, 21, 40, 8, 22, 33, 24, 20, 28, 26, 17, 18, 12, 10, 16, 11, 9, 5, 6, 7, 3,
  4, 2,
]

const banglaNameBySurahId = new Map([
  [1, 'আল-ফাতিহা'],
  [2, 'আল-বাকারাহ'],
  [3, 'আলে ইমরান'],
  [4, 'আন-নিসা'],
  [5, 'আল-মায়িদাহ'],
  [6, 'আল-আনআম'],
  [7, 'আল-আরাফ'],
  [8, 'আল-আনফাল'],
  [9, 'আত-তাওবাহ'],
  [10, 'ইউনুস'],
  [11, 'হূদ'],
  [12, 'ইউসুফ'],
  [13, 'আর-রাদ'],
  [14, 'ইবরাহীম'],
  [15, 'আল-হিজর'],
  [16, 'আন-নাহল'],
  [17, 'আল-ইসরা'],
  [18, 'আল-কাহফ'],
  [19, 'মারইয়াম'],
  [20, 'ত্বা-হা'],
  [21, 'আল-আম্বিয়া'],
  [22, 'আল-হজ্জ'],
  [23, 'আল-মুমিনূন'],
  [24, 'আন-নূর'],
  [25, 'আল-ফুরকান'],
  [26, 'আশ-শুআরা'],
  [27, 'আন-নামল'],
  [28, 'আল-কাসাস'],
  [29, 'আল-আনকাবুত'],
  [30, 'আর-রূম'],
  [31, 'লুকমান'],
  [32, 'আস-সাজদাহ'],
  [33, 'আল-আহযাব'],
  [34, 'সাবা'],
  [35, 'ফাতির'],
  [36, 'ইয়াসীন'],
  [37, 'আস-সাফফাত'],
  [38, 'সাদ'],
  [39, 'আয-যুমার'],
  [40, 'গাফির'],
  [41, 'ফুসসিলাত'],
  [42, 'আশ-শূরা'],
  [43, 'আয-যুখরুফ'],
  [44, 'আদ-দুখান'],
  [45, 'আল-জাসিয়াহ'],
  [46, 'আল-আহকাফ'],
  [47, 'মুহাম্মাদ'],
  [48, 'আল-ফাতহ'],
  [49, 'আল-হুজুরাত'],
  [50, 'কাফ'],
  [51, 'আয-যারিয়াত'],
  [52, 'আত-তূর'],
  [53, 'আন-নাজম'],
  [54, 'আল-কামার'],
  [55, 'আর-রহমান'],
  [56, 'আল-ওয়াকিয়াহ'],
  [57, 'আল-হাদীদ'],
  [58, 'আল-মুজাদিলাহ'],
  [59, 'আল-হাশর'],
  [60, 'আল-মুমতাহিনাহ'],
  [61, 'আস-সাফ'],
  [62, 'আল-জুমুআহ'],
  [63, 'আল-মুনাফিকুন'],
  [64, 'আত-তাগাবুন'],
  [65, 'আত-তালাক'],
  [66, 'আত-তাহরীম'],
  [67, 'আল-মুলক'],
  [68, 'আল-কালাম'],
  [69, 'আল-হাক্কাহ'],
  [70, 'আল-মাআরিজ'],
  [71, 'নূহ'],
  [72, 'আল-জিন'],
  [73, 'আল-মুযযাম্মিল'],
  [74, 'আল-মুদ্দাসসির'],
  [75, 'আল-কিয়ামাহ'],
  [76, 'আল-ইনসান'],
  [77, 'আল-মুরসালাত'],
  [78, 'আন-নাবা'],
  [79, 'আন-নাযিআত'],
  [80, 'আবাসা'],
  [81, 'আত-তাকভীর'],
  [82, 'আল-ইনফিতার'],
  [83, 'আল-মুতাফফিফীন'],
  [84, 'আল-ইনশিকাক'],
  [85, 'আল-বুরুজ'],
  [86, 'আত-তারিক'],
  [87, 'আল-আলা'],
  [88, 'আল-গাশিয়াহ'],
  [89, 'আল-ফাজর'],
  [90, 'আল-বালাদ'],
  [91, 'আশ-শামস'],
  [92, 'আল-লাইল'],
  [93, 'আদ-দুহা'],
  [94, 'আশ-শারহ'],
  [95, 'আত-তীন'],
  [96, 'আল-আলাক'],
  [97, 'আল-কদর'],
  [98, 'আল-বাইয়িনাহ'],
  [99, 'আয-যালযালাহ'],
  [100, 'আল-আদিয়াত'],
  [101, 'আল-কারিআহ'],
  [102, 'আত-তাকাসুর'],
  [103, 'আল-আসর'],
  [104, 'আল-হুমাযাহ'],
  [105, 'আল-ফীল'],
  [106, 'কুরাইশ'],
  [107, 'আল-মাউন'],
  [108, 'আল-কাউসার'],
  [109, 'আল-কাফিরুন'],
  [110, 'আন-নাসর'],
  [111, 'আল-মাসাদ'],
  [112, 'আল-ইখলাস'],
  [113, 'আল-ফালাক'],
  [114, 'আন-নাস'],
])

const tierByRank = [
  { maxRank: 25, tier: 'Beginner' },
  { maxRank: 55, tier: 'Easy-medium' },
  { maxRank: 85, tier: 'Medium-hard' },
  { maxRank: 114, tier: 'Hardest' },
]

const rankBySurahId = new Map(
  learningOrder.map((surahId, index) => [surahId, index + 1]),
)

const chaptersPayload = await readJson('qul-chapters-bn.json')
const arabicByKey = await readJson('digital-khatt-indopak-ayah-by-ayah-script.json')
const transliterationByKey = await readJson('english-transliteration-tajweed.json')
const translationByKey = await readJson('bn-taisirul-quran-simple.json')

await mkdir(surahOutputDir, { recursive: true })

const surahs = chaptersPayload.chapters.map((chapter) => {
  const rank = rankBySurahId.get(chapter.id)
  const tier = tierByRank.find((item) => rank <= item.maxRank)?.tier
  const banglaName = banglaNameBySurahId.get(chapter.id)

  if (!rank || !tier || !banglaName) {
    throw new Error(`Missing learning metadata for surah ${chapter.id}`)
  }

  if (chapter.pages.length !== 2) {
    throw new Error(`Invalid page range for surah ${chapter.id}`)
  }

  return {
    id: chapter.id,
    nameArabic: chapter.name_arabic,
    nameSimple: chapter.name_simple,
    banglaName,
    translatedNameBn: chapter.translated_name.name,
    learningRank: rank,
    learningTier: tier,
    versesCount: chapter.verses_count,
  }
})

await writeJson(path.join(outputDir, 'surahs.json'), surahs)

for (const surah of surahs) {
  const verses = []

  for (let ayahNumber = 1; ayahNumber <= surah.versesCount; ayahNumber += 1) {
    const verseKey = `${surah.id}:${ayahNumber}`
    const arabicVerse = arabicByKey[verseKey]
    const transliteration = transliterationByKey[verseKey]
    const translation = translationByKey[verseKey]

    if (!arabicVerse || !transliteration || !translation) {
      throw new Error(`Missing verse data for ${verseKey}`)
    }

    verses.push({
      verseKey,
      arabicIndopak: arabicVerse.text,
      transliterationEn: transliteration,
      translationBnTaisirul: translation.t,
    })
  }

  await writeJson(
    path.join(surahOutputDir, `${String(surah.id).padStart(3, '0')}.json`),
    verses,
  )
}

console.log(`Generated ${surahs.length} surah metadata records.`)
console.log(`Generated ${surahs.length} lazy verse chunks in ${surahOutputDir}.`)

async function readJson(fileName) {
  return JSON.parse(await readFile(path.join(resourcesDir, fileName), 'utf8'))
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value)}\n`)
}
