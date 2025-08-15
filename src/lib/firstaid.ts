// src/lib/firstaid.ts

export type Protocol = { title: string; steps: string[] }

const PROTOCOLS: Array<{ keywords: string[]; proto: Protocol }> = [
  {
    keywords: ['tonie', 'uton', 'topi', 'utonięcie', 'utonęła', 'utonął', 'pod wodą', 'w wodzie'],
    proto: {
      title: 'Utonięcie (pierwsza pomoc)',
      steps: [
        '1) **Zadzwoń 112** – podaj miejsce i sytuację.',
        '2) **Nie narażaj się.** Zasada: *sięgnij – rzuć – płyń* (sięgnij kijem/gałęzią, rzuć koło/linę, płyń TYLKO jeśli potrafisz i to bezpieczne).',
        '3) Po wydobyciu: **sprawdź oddech** (max 10 s).',
        '4) **Brak oddechu:** rozpocznij RKO 30:2 (30 uciśnięć klatki ~100–120/min, 2 oddechy). Użyj AED, jeśli dostępne.',
        '5) **Jest oddech:** ułóż w pozycji bezpiecznej, **ogrzewaj**, kontroluj oddech.',
        '6) Usuwaj mokrą odzież, osłoń przed wiatrem/zimnem.',
        '7) **Nie podnoś za nogi, nie wylewaj wody** z płuc – to nieskuteczne i niebezpieczne.',
        'Uwaga: informacje edukacyjne. W nagłym wypadku zawsze 112.'
      ]
    }
  },
  {
    keywords: ['krwotok', 'mocne krwawienie', 'krwawi mocno', 'rana cięta', 'rana kłuta'],
    proto: {
      title: 'Silny krwotok',
      steps: [
        '1) **Zadzwoń 112**.',
        '2) **Ucisk bezpośredni** miejsca krwawienia (czysty opatrunek/gaza/rękawiczki).',
        '3) Uniesienie kończyny (jeśli to możliwe).',
        '4) Nie zdejmuj nasiąkniętych opatrunków – **dokładaj kolejne**.',
        '5) Jeśli amputacja – zabezpiecz fragment (jałowo, w worku, chłodź pośrednio).',
        '6) Obserwuj objawy wstrząsu (bladość, zimny pot, osłabienie) – **ułóż** poszkodowanego, okryj.',
        'Uwaga: edukacyjne, w razie wątpliwości dzwoń 112.'
      ]
    }
  },
  {
    keywords: ['zadławienie', 'dławi', 'zakrztuszenie', 'choking', 'heimlich'],
    proto: {
      title: 'Zadławienie (dorosły, przytomny)',
      steps: [
        '1) Zachęć do kaszlu.',
        '2) **5 uderzeń** między łopatki (mocnych).',
        '3) **5 uciśnięć nadbrzusza** (Heimlich).',
        '4) Naprzemiennie 5 + 5, aż do skutku lub utraty przytomności.',
        '5) Utrata przytomności → **RKO** i 112.',
        'Uwaga: dla niemowląt technika inna – sprawdź instrukcję w „Instrukcje”.'
      ]
    }
  },
  {
    keywords: ['oparzenie', 'poparzył', 'sparzył'],
    proto: {
      title: 'Oparzenie',
      steps: [
        '1) **Chłodź wodą** 15–20 min (nie lodem).',
        '2) Usuń biżuterię/odzież **nieprzylegającą**.',
        '3) **Jałowy, suchy opatrunek**; nie przekłuwaj pęcherzy.',
        '4) Oparzenia chemiczne → spłukuj obficie wodą.',
        '5) Rozległe/ twarz/ drogi oddechowe → **112**.'
      ]
    }
  }
]

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

export function getProtocolByQuery(q: string): Protocol | null {
  const nq = normalize(q)
  for (const { keywords, proto } of PROTOCOLS) {
    if (keywords.some(k => nq.includes(normalize(k)))) return proto
  }
  return null
}
