import type { Lang } from '../i18n/ui';
import type { Contact } from '../lib/contacts';

// Shape mirrors the future Directus collections. Every text field is per-language.
export type Local<T> = Record<Lang, T>;

export interface MediaSlot {
  // What the owner should shoot/collect for this slot. Shown inside the placeholder.
  hint: Local<string>;
  kind: 'photo' | 'video' | 'map' | 'logo';
  // Real asset path (public/...). Once set, it replaces the placeholder box.
  src?: string;
  // Video only: still frame shown before playback (public/...).
  poster?: string;
}

export interface Skater {
  slug: string;
  name: string;
  alias?: string;
  yearsSkating: number;
  crew: string;
  discipline: 'street' | 'bowl' | 'beginner';
  featuredFrom: string; // ISO date, start of the 2-week slot
  bio: Local<string>;
  favorites: Local<string>;
  portrait: MediaSlot;
  clip: MediaSlot;
}

export interface Post {
  slug: string;
  title: Local<string>;
  date: string;
  author: string;
  category: 'park-updates' | 'community' | 'culture' | 'events' | 'interviews';
  excerpt: Local<string>;
  body: Local<string>;
  cover: MediaSlot;
}

export interface Partner {
  slug: string;
  name: string;
  intro: Local<string>;
  link?: string;
  logo: MediaSlot;
}

export interface EventItem {
  slug: string;
  title: Local<string>;
  date: string;
  organizer: string;
  description: Local<string>;
  past: boolean;
  photo: MediaSlot;
}

export type Severity = 'ok' | 'repair' | 'hazard';

export interface ConditionEntry {
  date: string;
  spot: Local<string>; // obstacle / location on the map
  severity: Severity;
  note: Local<string>;
  photo: MediaSlot;
}

export const skaters: Skater[] = [
  {
    slug: 'raka-jr',
    name: 'Raka Pratama',
    alias: 'JR',
    yearsSkating: 9,
    crew: 'Flyover Family',
    discipline: 'street',
    featuredFrom: '2026-10-05',
    bio: {
      id: 'Reguler pagi sejak 2017. Dikenal karena kickflip backside 50-50 di ledge panjang sisi barat.',
      en: 'Morning regular since 2017. Known for a kickflip backside 50-50 on the long west ledge.',
    },
    favorites: {
      id: 'Ledge barat, flatground tengah, manual pad dekat pilar 4.',
      en: 'West ledge, center flatground, manual pad near pillar 4.',
    },
    portrait: {
      kind: 'photo',
      hint: {
        id: 'FOTO: potret vertikal JR dengan papan, latar pilar beton, hitam-putih',
        en: 'PHOTO: vertical portrait of JR holding his board, concrete pillar backdrop, black and white',
      },
    },
    clip: {
      kind: 'video',
      hint: {
        id: 'VIDEO: embed Instagram/YouTube — line terbaik JR di ledge barat, 15-30 detik',
        en: 'VIDEO: Instagram/YouTube embed — JR’s best line on the west ledge, 15-30 seconds',
      },
    },
  },
  {
    slug: 'sinta-maheswari',
    name: 'Sinta Maheswari',
    yearsSkating: 4,
    crew: 'Skena Putri Bandung',
    discipline: 'street',
    featuredFrom: '2026-09-21',
    bio: {
      id: 'Mulai dari flatground 2022, sekarang rajin mengajari pemula tiap Sabtu pagi.',
      en: 'Started on flatground in 2022, now teaches beginners every Saturday morning.',
    },
    favorites: {
      id: 'Flatground tengah, bank kecil sisi timur.',
      en: 'Center flatground, small bank on the east side.',
    },
    portrait: {
      kind: 'photo',
      hint: {
        id: 'FOTO: Sinta saat mengajar anak-anak pemula, candid, hitam-putih',
        en: 'PHOTO: Sinta teaching beginner kids, candid, black and white',
      },
    },
    clip: {
      kind: 'video',
      hint: {
        id: 'VIDEO: sesi klinik pemula Sabtu pagi atau line street Sinta',
        en: 'VIDEO: Saturday beginner clinic session or Sinta’s street line',
      },
    },
  },
  {
    slug: 'bang-udin',
    name: 'Udin Saepudin',
    alias: 'Bang Udin',
    yearsSkating: 18,
    crew: 'Pasupati Old School',
    discipline: 'bowl',
    featuredFrom: '2026-09-07',
    bio: {
      id: 'Salah satu skater paling senior di Pasupati. Saksi perubahan taman dari awal.',
      en: 'One of the most senior skaters at Pasupati. Witnessed the park’s changes from the start.',
    },
    favorites: {
      id: 'Quarter pipe besar, bowl corner.',
      en: 'Big quarter pipe, bowl corner.',
    },
    portrait: {
      kind: 'photo',
      hint: {
        id: 'FOTO: potret Bang Udin duduk di coping quarter pipe, senyum, hitam-putih',
        en: 'PHOTO: Bang Udin sitting on the quarter pipe coping, smiling, black and white',
      },
    },
    clip: {
      kind: 'video',
      hint: {
        id: 'VIDEO: run bowl Bang Udin, atau wawancara singkat soal sejarah taman',
        en: 'VIDEO: Bang Udin’s bowl run, or a short interview about the park’s history',
      },
    },
  },
];

export const posts: Post[] = [
  {
    slug: 'kenapa-kami-mencatat',
    title: { id: 'Kenapa Kami Mencatat Taman Ini', en: 'Why We Are Recording This Park' },
    date: '2026-10-12',
    author: 'Kenni',
    category: 'culture',
    excerpt: {
      id: 'Tanpa catatan, keluhan mudah diabaikan. Situs ini mulai dari hal sederhana: foto beri tanggal.',
      en: 'Without a record, concerns are easy to dismiss. This site starts simple: date every photo.',
    },
    body: {
      id: 'Pasupati dipakai setiap hari oleh puluhan skater, tapi tidak ada catatan publik soal kondisinya. Situs ini adalah usaha mengubah itu — dokumentasi dulu, percakapan dengan kota kemudian.\n\nSemua foto di catatan kondisi diberi tanggal dan lokasi. Bukan untuk menyalahkan siapa-siapa, hanya supaya fakta bisa bicara sendiri.',
      en: 'Pasupati is used daily by dozens of skaters, yet there is no public record of its condition. This site is an attempt to change that — document first, talk to the city later.\n\nEvery photo in the condition record is dated and located. Not to blame anyone — just so the facts can speak for themselves.',
    },
    cover: {
      kind: 'photo',
      hint: {
        id: 'FOTO SAMPUL: suasana ramai taman sore hari, wide shot dari ujung timur, hitam-putih',
        en: 'COVER PHOTO: busy afternoon scene at the park, wide shot from the east end, black and white',
      },
    },
  },
  {
    slug: 'kerja-bakti-oktober',
    title: { id: 'Kerja Bakti: Sapu Bersama 11 Oktober', en: 'Clean-up Day: Sweep Together, October 11' },
    date: '2026-10-11',
    author: 'Kenni',
    category: 'events',
    excerpt: {
      id: 'Empat belas orang, dua jam, satu taman yang lebih bersih. Begini cara komunitas merawat rumahnya.',
      en: 'Fourteen people, two hours, one cleaner park. This is how the community takes care of its home.',
    },
    body: {
      id: 'Empat belas skater dari tiga kru berbeda datang membawa sapu dan kantong sampah. Dua jam kemudian flatground bisa dipakai lagi tanpa kerikil.\n\nKerja bakti akan diadakan rutin. Ikuti halaman Acara untuk jadwal berikutnya.',
      en: 'Fourteen skaters from three different crews showed up with brooms and trash bags. Two hours later the flatground was rideable again, gravel-free.\n\nClean-ups will run regularly. Watch the Events page for the next date.',
    },
    cover: {
      kind: 'photo',
      hint: {
        id: 'FOTO SAMPUL: grup foto relawan kerja bakti dengan sapu, atau before/after flatground',
        en: 'COVER PHOTO: group shot of clean-up volunteers with brooms, or before/after of the flatground',
      },
    },
  },
  {
    slug: 'retak-di-bank-timur',
    title: { id: 'Catatan Kondisi: Retak di Bank Timur', en: 'Condition Note: Crack on the East Bank' },
    date: '2026-10-08',
    author: 'Kenni',
    category: 'park-updates',
    excerpt: {
      id: 'Retakan selebar 2 cm muncul di transisi bank timur. Ditandai berbahaya untuk roda kecil.',
      en: 'A 2 cm-wide crack appeared on the east bank transition. Marked as a hazard for small wheels.',
    },
    body: {
      id: 'Retakan di transisi bank timur pertama kali terlihat awal Oktober dan melebar dalam seminggu. Foto sudut yang sama akan diambil tiap minggu untuk memantau perkembangannya.',
      en: 'The crack on the east bank transition was first spotted in early October and widened within a week. The same photo angle will be retaken weekly to track it.',
    },
    cover: {
      kind: 'photo',
      hint: {
        id: 'FOTO SAMPUL: close-up retakan dengan penggaris/koin sebagai skala, sertakan tanggal di frame',
        en: 'COVER PHOTO: close-up of the crack with a ruler/coin for scale, date visible in frame',
      },
    },
  },
];

export const partners: Partner[] = [
  {
    slug: 'tup',
    name: 'TUP Skateboard',
    intro: {
      id: 'Partner taman. Sewa papan dan para pengajar komunitas datang dari TUP Skateboard.',
      en: 'The park’s partner. The board rental and the community coaches come from TUP Skateboard.',
    },
    link: 'https://www.instagram.com/tup.storre/',
    logo: {
      kind: 'logo',
      src: '/images/tup-logo.webp',
      hint: { id: 'LOGO: logo TUP', en: 'LOGO: TUP logo' },
    },
  },
];

export const events: EventItem[] = [
  {
    slug: 'kerja-bakti-november',
    title: { id: 'Kerja Bakti November', en: 'November Clean-up Day' },
    date: '2026-11-08',
    organizer: 'Flyover Family',
    description: {
      id: 'Sapu bersama, perbaikan kecil manual pad. Bawa sapu dan sarung tangan sendiri.',
      en: 'Group sweep, small manual pad fixes. Bring your own broom and gloves.',
    },
    past: false,
    photo: {
      kind: 'photo',
      hint: { id: 'FOTO: poster acara atau foto kerja bakti sebelumnya', en: 'PHOTO: event poster or photo from a previous clean-up' },
    },
  },
  {
    slug: 'game-of-skate-oktober',
    title: { id: 'Game of SKATE Antar-Kru', en: 'Inter-crew Game of SKATE' },
    date: '2026-10-25',
    organizer: 'Bandung Skate Scene',
    description: {
      id: 'Format terbuka untuk semua kru. Pendaftaran di tempat, gratis.',
      en: 'Open format for all crews. Registration on site, free.',
    },
    past: false,
    photo: {
      kind: 'photo',
      hint: { id: 'FOTO: poster Game of SKATE', en: 'PHOTO: Game of SKATE poster' },
    },
  },
  {
    slug: 'kerja-bakti-oktober',
    title: { id: 'Kerja Bakti Oktober', en: 'October Clean-up Day' },
    date: '2026-10-11',
    organizer: 'Flyover Family',
    description: {
      id: '14 orang, 2 jam. Rekap lengkap ada di Jurnal.',
      en: '14 people, 2 hours. Full recap in the Journal.',
    },
    past: true,
    photo: {
      kind: 'photo',
      hint: { id: 'FOTO: dokumentasi kerja bakti 11 Oktober — before/after flatground', en: 'PHOTO: October 11 clean-up documentation — before/after of the flatground' },
    },
  },
];

export const conditionEntries: ConditionEntry[] = [
  {
    date: '2026-10-08',
    spot: { id: 'Bank timur — transisi', en: 'East bank — transition' },
    severity: 'hazard',
    note: {
      id: 'Retakan 2 cm dan melebar. Roda kecil bisa tersangkut.',
      en: '2 cm crack, widening. Small wheels can catch.',
    },
    photo: {
      kind: 'photo',
      hint: {
        id: 'FOTO: close-up retakan + sudut wide bank timur, dua foto, bertanggal',
        en: 'PHOTO: close-up of the crack + wide angle of the east bank, two shots, dated',
      },
    },
  },
  {
    date: '2026-10-08',
    spot: { id: 'Manual pad pilar 4', en: 'Manual pad, pillar 4' },
    severity: 'repair',
    note: {
      id: 'Coping longgar, bergeser saat kena grind.',
      en: 'Coping is loose, shifts when grinded.',
    },
    photo: {
      kind: 'photo',
      hint: { id: 'FOTO: sisi coping yang longgar, tunjukkan celahnya', en: 'PHOTO: side of the loose coping, show the gap' },
    },
  },
  {
    date: '2026-10-08',
    spot: { id: 'Flatground tengah', en: 'Center flatground' },
    severity: 'ok',
    note: {
      id: 'Bersih setelah kerja bakti. Permukaan mulus.',
      en: 'Clean after the clean-up day. Surface is smooth.',
    },
    photo: {
      kind: 'photo',
      hint: { id: 'FOTO: wide shot flatground bersih', en: 'PHOTO: wide shot of the clean flatground' },
    },
  },
];

export const usageSnapshot = {
  period: { id: '21 Sep – 11 Okt 2026', en: 'Sep 21 – Oct 11, 2026' },
  avgPerDay: 34,
  peakHours: { id: '16.00–18.30 WIB', en: '4:00–6:30 PM' },
  busiestDay: { id: 'Sabtu', en: 'Saturday' },
  note: {
    id: 'Dihitung manual tiga kali sehari (pagi, sore, malam) selama tiga minggu. Agregat, tanpa data pribadi.',
    en: 'Counted manually three times a day (morning, afternoon, evening) for three weeks. Aggregated, no personal data.',
  },
};

export const timeline: { year: string; text: Local<string> }[] = [
  {
    year: '2009',
    text: { id: 'Jalan layang Pasupati selesai; ruang bawahnya mulai dipakai skater.', en: 'Pasupati flyover completed; the space below starts attracting skaters.' },
  },
  {
    year: '2014',
    text: { id: 'Obstacle beton pertama dibangun bersama oleh komunitas.', en: 'First concrete obstacles built together by the community.' },
  },
  {
    year: '2019',
    text: { id: 'Renovasi area oleh kota; beberapa obstacle ditambah.', en: 'Area renovated by the city; several obstacles added.' },
  },
  {
    year: '2026',
    text: { id: 'Situs ini diluncurkan untuk mencatat taman secara rutin.', en: 'This site launches to record the park regularly.' },
  },
];

// Slides for the "about this site" carousel on Home.
export const aboutSlides: MediaSlot[] = [
  {
    kind: 'photo',
    hint: {
      id: 'SLIDE 1: foto lebar taman dari atas jalan layang, hitam-putih',
      en: 'SLIDE 1: wide shot of the park from the flyover, black and white',
    },
  },
  {
    kind: 'photo',
    hint: {
      id: 'SLIDE 2: kerja bakti — orang menyapu flatground, candid',
      en: 'SLIDE 2: clean-up day — people sweeping the flatground, candid',
    },
  },
  {
    kind: 'photo',
    hint: {
      id: 'SLIDE 3: sesi pemula Sabtu pagi, anak-anak dengan helm',
      en: 'SLIDE 3: Saturday beginner session, kids wearing helmets',
    },
  },
  {
    kind: 'photo',
    hint: {
      id: 'SLIDE 4: sesi malam di bawah lampu jalan layang',
      en: 'SLIDE 4: night session under the flyover lights',
    },
  },
];

// Obstacles: used by the gallery on The Park page.
export interface Obstacle {
  slug: string;
  name: Local<string>;
  type: Local<string>;
  note: Local<string>;
  condition?: Severity;
  lastChecked: string;
  photo: MediaSlot;
}

export const obstacles: Obstacle[] = [
  {
    slug: 'ledge-barat',
    name: { id: 'Ledge Barat', en: 'West Ledge' },
    type: { id: 'Ledge', en: 'Ledge' },
    note: {
      id: 'Ledge beton panjang ±12 m, tinggi sedang. Spot paling ramai saat sore.',
      en: 'Long concrete ledge, roughly 12 m, medium height. Busiest spot in the afternoon.',
    },
    condition: 'ok',
    lastChecked: '2026-10-08',
    photo: {
      kind: 'photo',
      hint: { id: 'FOTO: ledge barat dari samping, sertakan skater untuk skala', en: 'PHOTO: west ledge from the side, include a skater for scale' },
    },
  },
  {
    slug: 'bank-timur',
    name: { id: 'Bank Timur', en: 'East Bank' },
    type: { id: 'Bank / Transisi', en: 'Bank / Transition' },
    note: {
      id: 'Transisi landai menuju pilar. Ada retakan yang melebar sejak Oktober.',
      en: 'Gentle transition into the pillar. Has a crack that has been widening since October.',
    },
    condition: 'hazard',
    lastChecked: '2026-10-08',
    photo: {
      kind: 'photo',
      hint: { id: 'FOTO: bank timur wide + close-up retakan', en: 'PHOTO: wide shot of the east bank + close-up of the crack' },
    },
  },
  {
    slug: 'manual-pad-pilar-4',
    name: { id: 'Manual Pad Pilar 4', en: 'Manual Pad, Pillar 4' },
    type: { id: 'Manual pad', en: 'Manual pad' },
    note: {
      id: 'Pad rendah di kaki pilar 4. Coping mulai longgar.',
      en: 'Low pad at the base of pillar 4. The coping is starting to loosen.',
    },
    condition: 'repair',
    lastChecked: '2026-10-08',
    photo: {
      kind: 'photo',
      hint: { id: 'FOTO: manual pad pilar 4, tunjukkan coping', en: 'PHOTO: manual pad at pillar 4, show the coping' },
    },
  },
  {
    slug: 'quarter-pipe',
    name: { id: 'Quarter Pipe', en: 'Quarter Pipe' },
    type: { id: 'Transition', en: 'Transition' },
    note: {
      id: 'Transisi terbesar di taman, menghadap ke utara. Permukaan masih mulus.',
      en: 'The park’s biggest transition, facing north. Surface is still smooth.',
    },
    condition: 'ok',
    lastChecked: '2026-10-08',
    photo: {
      kind: 'photo',
      hint: { id: 'FOTO: quarter pipe, sudut rendah dari bawah', en: 'PHOTO: quarter pipe, low angle from the bottom' },
    },
  },
  {
    slug: 'flatground-tengah',
    name: { id: 'Flatground Tengah', en: 'Center Flatground' },
    type: { id: 'Flatground', en: 'Flatground' },
    note: {
      id: 'Area datar utama untuk warm-up. Dibersihkan tiap kerja bakti bulanan.',
      en: 'Main flat area for warm-ups. Swept at every monthly clean-up.',
    },
    condition: 'ok',
    lastChecked: '2026-10-08',
    photo: {
      kind: 'photo',
      hint: { id: 'FOTO: flatground tengah, wide shot dari ujung timur', en: 'PHOTO: center flatground, wide shot from the east end' },
    },
  },
  {
    slug: 'bowl-corner',
    name: { id: 'Bowl Corner', en: 'Bowl Corner' },
    type: { id: 'Bowl', en: 'Bowl' },
    note: {
      id: 'Sudut bowl dengan coping paling tebal. Favorit para senior.',
      en: 'Bowl corner with the thickest coping. A senior favourite.',
    },
    condition: 'ok',
    lastChecked: '2026-10-08',
    photo: {
      kind: 'photo',
      hint: { id: 'FOTO: bowl corner, tunjukkan coping dan dinding', en: 'PHOTO: bowl corner, show the coping and the wall' },
    },
  },
];

// Reference clip per discipline, embedded when a coach's specialty is tapped.
// Swap `id` to change the clip; a missing id leaves the label as plain text.
export type SpecialtyKey = 'street' | 'bowl' | 'transition';

export const specialtyVideos: Record<SpecialtyKey, { id: string; by: string; vertical?: boolean }> = {
  street: { id: '2qFgoSLzErA', by: 'Skateboarding Stories', vertical: true },
  bowl: { id: 'wd-VD__yTb0', by: 'ItzTekk', vertical: true },
  transition: { id: '_KgiJGjpABw', by: 'Zack Dowdy', vertical: true },
};

// Lesson providers. Optional listing on Home — contact details are published
// ONLY with the provider's explicit consent (see consentOn).
export interface LessonProvider {
  slug: string;
  name: string;
  age?: number; // published only if the provider wants it shown
  yearsSkating?: number;
  competition?: Local<string>; // competition experience, free text
  specialty?: Local<string>; // e.g. Street, Bowl, Transition & bowl
  specialtyKey?: SpecialtyKey; // picks the reference video
  partner?: string; // slug of the partner they are under (see partners)
  levels: Local<string>;
  contacts: Contact[];
  rate?: Local<string>;
  consentOn: string;
  portrait: MediaSlot;
  trainingVideo: MediaSlot; // coaching a session
  trickVideo: MediaSlot; // their own riding
}

export const lessonProviders: LessonProvider[] = [
  {
    slug: 'arif-ajah',
    name: 'Arif ajah',
    age: 19,
    yearsSkating: 4,
    specialty: { id: 'Street', en: 'Street' },
    specialtyKey: 'street',
    partner: 'tup',
    levels: { id: 'Beginner to Intermediate', en: 'Beginner to Intermediate' },
    contacts: [
      { kind: 'instagram', value: 'arif_ibdr' },
      { kind: 'whatsapp', value: '0895418294397' },
      { kind: 'tiktok', value: 'arif_skateboards' },
    ],
    consentOn: '2026-10-21',
    portrait: {
      kind: 'photo',
      hint: { id: 'FOTO: Arif, potret di lapangan terbuka', en: 'PHOTO: Arif, portrait outdoors' },
      src: '/media/coaches/arif-ajah/portrait.webp',
    },
    trainingVideo: {
      kind: 'video',
      hint: {
        id: 'VIDEO: sesi mengajar — Arif memandu pemula, 30–60 detik, rekaman HP cukup',
        en: 'VIDEO: teaching session — Arif guiding a beginner, 30–60 seconds, phone footage is fine',
      },
    },
    trickVideo: {
      kind: 'video',
      hint: {
        id: 'VIDEO: trik andalan Arif — satu line bersih, 15–30 detik',
        en: 'VIDEO: Arif’s signature trick — one clean line, 15–30 seconds',
      },
      src: '/media/coaches/arif-ajah/riding.mp4',
      poster: '/media/coaches/arif-ajah/riding-poster.webp',
    },
  },
  {
    slug: 'hadi-baik',
    name: 'Hadi Baik',
    age: 21,
    yearsSkating: 2,
    specialty: { id: 'Street', en: 'Street' },
    specialtyKey: 'street',
    partner: 'tup',
    levels: { id: 'Beginner to Intermediate', en: 'Beginner to Intermediate' },
    contacts: [
      { kind: 'instagram', value: '_hadibaik' },
      { kind: 'whatsapp', value: '087784878716' },
      { kind: 'tiktok', value: 'sjajejdjdnej' },
    ],
    consentOn: '2026-10-21',
    portrait: {
      kind: 'photo',
      hint: { id: 'FOTO: Potret Hadi', en: 'PHOTO: Portrait of Hadi' },
    },
    trainingVideo: {
      kind: 'video',
      hint: {
        id: 'VIDEO: sesi mengajar — Hadi memandu pemula, 30–60 detik, rekaman HP cukup',
        en: 'VIDEO: teaching session — Hadi guiding a beginner, 30–60 seconds, phone footage is fine',
      },
      src: '/media/coaches/hadi-baik/teaching.mp4',
      poster: '/media/coaches/hadi-baik/teaching-poster.webp',
    },
    trickVideo: {
      kind: 'video',
      hint: {
        id: 'VIDEO: trik andalan Hadi — satu line bersih, 15–30 detik',
        en: 'VIDEO: Hadi’s signature trick — one clean line, 15–30 seconds',
      },
    },
  },
  {
    slug: 'udin',
    name: 'Udin',
    age: 19,
    yearsSkating: 6,
    specialty: { id: 'Transisi & Bowl', en: 'Transition & bowl' },
    specialtyKey: 'transition',
    levels: { id: 'Beginner to Intermediate', en: 'Beginner to Intermediate' },
    contacts: [
      { kind: 'instagram', value: '_3rrrrrrr' },
      { kind: 'tiktok', value: 'ernazhiem' },
    ],
    consentOn: '2026-10-22',
    portrait: {
      kind: 'photo',
      hint: { id: 'FOTO: Potret Udin', en: 'PHOTO: Portrait of Udin' },
    },
    trainingVideo: {
      kind: 'video',
      hint: {
        id: 'VIDEO: sesi mengajar — Udin memandu pemula, 30–60 detik, rekaman HP cukup',
        en: 'VIDEO: teaching session — Udin guiding a beginner, 30–60 seconds, phone footage is fine',
      },
    },
    trickVideo: {
      kind: 'video',
      hint: {
        id: 'VIDEO: trik andalan Udin — satu line bersih, 15–30 detik',
        en: 'VIDEO: Udin’s signature trick — one clean line, 15–30 seconds',
      },
    },
  },
];

// Board rental + optional buddy. Surfaced as a callout in the instructors
// section on Home and as FAQ entries, so newcomers find it either way.
export const boardRental = {
  label: { id: 'Sewa Papan', en: 'Board Rental' },
  partner: 'tup', // the rental is run by TUP — logo shown on the callout
  title: { id: 'Sewa papan & pendamping', en: 'Board rental & a buddy' },
  body: {
    id: 'Kita sedia sewa papan. Semisal butuh pendamping saat pertama kali mencoba, kita sedia juga.',
    en: 'We rent boards out. And if you want someone beside you the first time, we can provide a buddy too.',
  },
  rates: [
    {
      label: { id: 'Sewa papan', en: 'Board rental' },
      price: { id: 'Rp15.000 / jam', en: 'Rp15,000 / hour' },
    },
    {
      label: { id: 'Pendamping · 15 tahun ke atas', en: 'Buddy · 15 and over' },
      price: { id: 'Rp50.000 / jam', en: 'Rp50,000 / hour' },
    },
  ],
  underFifteen: {
    id: 'Di bawah 15 tahun langsung private.',
    en: 'Under 15 goes straight to private.',
  },
  note: {
    id: 'Tidak perlu beli papan dulu. Sewa ini ada untuk yang masih penasaran dan ingin coba-coba.',
    en: 'No need to buy a board first. The rental exists for people who are curious and want to try it out.',
  },
  buddyTip: {
    id: 'Pendamping menemani, mengajarkan dasar-dasar skateboard, dan menjaga kamu saat mencoba bersama skater lain di taman.',
    en: 'A buddy stays with you, teaches the skateboarding basics, and keeps an eye on you while you try it out with the other skaters at the park.',
  },
  cta: { id: 'Tanya soal sewa', en: 'Ask about rentals' },
};

// FAQ — shown on Home.
export const faqs: { q: Local<string>; a: Local<string> }[] = [
  {
    q: { id: 'Di mana lokasinya dan apakah gratis?', en: 'Where is it, and is it free?' },
    a: {
      id: 'Di kolong jalan layang Pasupati, Bandung. Gratis dan terbuka untuk umum — tidak ada tiket atau jam buka resmi.',
      en: 'Under the Pasupati flyover, Bandung. Free and open to the public — no ticket, no official opening hours.',
    },
  },
  {
    q: { id: 'Apakah bisa sewa papan?', en: 'Can I rent a board?' },
    a: {
      id: 'Bisa. Sewa papan Rp15.000 per jam. Kalau butuh pendamping saat mencoba, Rp50.000 per jam (15 tahun ke atas). Di bawah 15 tahun langsung private.',
      en: 'Yes. Board rental is Rp15,000 per hour. If you want a buddy while you try it, it is Rp50,000 per hour (15 and over). Under 15 goes straight to private.',
    },
  },
  {
    q: { id: 'Kenapa kita menyediakan sewa papan?', en: 'Why do you rent boards out?' },
    a: {
      id: 'Karena banyak orang yang penasaran main skateboard, tapi belum mampu untuk beli papan. Makanya kita sedia sewa papan supaya bisa coba-coba dulu.',
      en: 'Because plenty of people are curious about skateboarding but can’t afford to buy a board yet. Renting lets them try it out first.',
    },
  },
  {
    q: { id: 'Kapan waktu terbaik untuk pemula?', en: 'When is the best time for beginners?' },
    a: {
      id: 'Pagi hari, sekitar 07.00–10.00, saat taman masih lengang. Jam tersibuk adalah 16.00–18.30, terutama Sabtu.',
      en: 'Mornings, roughly 7–10 AM, while the park is still quiet. The busiest window is 4:00–6:30 PM, especially Saturday.',
    },
  },
  {
    q: { id: 'Apakah harus memakai helm?', en: 'Is a helmet required?' },
    a: {
      id: 'Tidak ada aturan resmi, tetapi kami mendorong helm untuk pemula dan semua anak di bawah 18 tahun.',
      en: 'There is no official rule, but we encourage helmets for beginners and everyone under 18.',
    },
  },
  {
    q: { id: 'Bagaimana kalau ada obstacle yang rusak?', en: 'What if an obstacle is damaged?' },
    a: {
      id: 'Kirim foto dan lokasinya lewat halaman Tentang. Catatan bertanggal seperti itu masuk ke catatan kondisi taman.',
      en: 'Send a photo and location via the About page. Dated entries like that go straight into the park condition record.',
    },
  },
  {
    q: { id: 'Dari mana angka penggunaan taman berasal?', en: 'Where do the usage numbers come from?' },
    a: {
      id: 'Dihitung manual tiga kali sehari selama beberapa minggu, lalu dirata-ratakan. Semuanya agregat — tidak ada data pribadi.',
      en: 'Counted by hand three times a day over several weeks, then averaged. All aggregated — no personal data.',
    },
  },
  {
    q: { id: 'Saya mau mengajar skateboard. Bagaimana caranya?', en: 'I want to teach skateboarding. How?' },
    a: {
      id: 'Hubungi kami lewat halaman Tentang dengan kontak yang ingin dipublikasikan dan tanggal mulai. Kami hanya mencantumkan kontak setelah ada persetujuan tertulis.',
      en: 'Reach out via the About page with the contact details you want published and a start date. Contacts are listed only after written consent.',
    },
  },
  {
    q: { id: 'Apakah situs ini milik pemerintah?', en: 'Is this site run by the government?' },
    a: {
      id: 'Bukan. Ini proyek komunitas independen oleh salah satu reguler taman, dibuat agar catatan publik tersedia untuk semua pihak.',
      en: 'No. It is an independent community project by one of the park regulars, built so a public record exists for everyone.',
    },
  },
];
