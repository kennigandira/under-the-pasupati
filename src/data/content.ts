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
  // Inline art, anchored to the Nth body paragraph (1-based, counted in both languages).
  inline?: { afterParagraph: number; slot: MediaSlot }[];
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
    slug: 'meet-arif',
    title: { id: 'Meet Arif: Hidup dengan Makna Punk-nya Sendiri', en: 'Meet Arif: Living Life on His Own Punk Terms' },
    date: '2026-10-25',
    author: 'RoxyRoller',
    category: 'interviews',
    excerpt: {
      id: 'Arif, 19 tahun: mengajar skateboard di kolong Pasupati, berjualan papan, dan memegang prinsipnya sendiri.',
      en: 'Arif, 19: teaching skateboarding under the Pasupati flyover, selling boards, and keeping to his own principles.',
    },
    body: {
      id: 'Pembuka dari seri blog ini adalah sebuah sesi perkenalan dengan Arif, seorang remaja laki-laki 19 tahun yang aktif berkegiatan dalam skena skateboard di skatepark yang ada di bawah jembatan Pasupati Bandung. Tak semata hanya asyik memainkan papannya, Arif berkontribusi dalam misi mencetak pemain-pemain skateboard hebat jebolan “kolong”, sebutan untuk skatepark di bawah Pasupati. Arif biasa melatih muridnya dari berbagai usia, gender, serta level beginner - intermediate. “Aku tuh ngajar selain untuk uang tambahan, karena aku udah gak dibiayain orang tua lagi, aku ngerasa puas dan bangga kalau murid aku jadi pada bisa. Bahkan ada yang tadinya penakut banget, sekarang udah bisa berani drop in sendiri dan mau nyoba trick ini itu.”, jelas Arif dengan antusias. Arif memang rutin datang ke skatepark Pasupati. Ia bersedia membantu para muridnya yang datang di luar jadwal latihan, tanpa tambahan biaya apa pun.\n\nArif biasa memulai harinya di jam 5 subuh dan mengakhirinya di jam 11 malam. Di waktu-waktu itu, Arif sudah menyusun jadwalnya sedemikian rupa agar segala prioritasnya bisa terpenuhi. Ia harus membagi waktu antara kehidupan sosial, cinta, kuliah, serta usahanya untuk memenuhi kebutuhan sehari-hari. Dalam usahanya ini, selain mengajar skateboard, Arif bekerja paruh waktu di sebuah resto pizza dan juga menjalankan bisnis. Bisnis yang ia tekuni adalah jual-beli papan skateboard serta perintilannya, streetwear clothing, dan juga sewa papan skateboard yang dibanderol 15.000 rupiah per jamnya. Bisnis ini bernamakan TUP (Triumph Under Pressure), ia jalankan bersama kakak laki-lakinya, Hadi. Selain Hadi, ia juga menjalankan bisnis tersebut dengan pamannya, yang biasa dipanggil om Firman. Om Firman adalah sosok yang mendorong Arif untuk mencoba berkenalan dengan skateboard ketika Arif masih duduk di kelas 2 SMK. Alih-alih mencobanya, Arif memutuskan untuk menekuninya.\n\nSaya yang mendengar segala rentetan kegiatan Arif di usianya yang muda itu, hanya bisa mengingat kembali akan masa muda yang saya jalani tanpa banyak hal positif yang saya buat. Seraya ia menjelaskan tentang prinsipnya yang selalu mengutamakan hal yang bermanfaat untuk dirinya, tentu saja dalam artian yang baik. Menurut saya, Arif adalah sosok yang sangat lepas dari stereotype anak skateboard pada umumnya dan Arif pun mengamini itu. Misal dalam pandangannya akan rokok dan minuman keras. Di tengah kepungan asap rokok di tongkrongannya, Arif tetap berpegang teguh kalau rokok tidak ada manfaatnya sama sekali untuk tubuhnya. Malah ia berpendapat kalau rokok akan menurunkan performanya dalam bermain skateboard dan menjalankan rutinitasnya yang padat. Serta ia tidak pernah merasa tertarik dengan minuman keras, lagi-lagi juga karena menurutnya tidak memiliki manfaat.\n\nSelain kagum akan prinsip yang Arif pegang, saya juga bertanya-tanya apakah mungkin Arif pernah lelah akan semua itu? Atau justru ia menikmatinya? “Capek mah pasti. Tapi selalu ada hal yang bikin aku back on track. Selain keluarga, karena aku juga membantu sedikit perekonomiannya, yaitu selalu bersyukur.” Oke, mendengar pernyataan “bersyukur” itu agak klise. Tapi kemudian Arif melanjutkan, “Gak semua orang bisa dapetin kayak yang aku punya sekarang; bisa dapat uang dari hal yang aku suka. Banyak di luar sana yang susah cari kerja, bahkan ada yang terpaksa nyari uang padahal dia gak suka sama bidang yang dia kerjain sama sekali.” Kalimatnya cukup sederhana, tapi bermakna dalam karena kita hidup di era yang jika kita mau bertahan hidup, pilihan kita tidak banyak. Di luar sana, bahkan banyak orang yang rela melakukan hal yang jelas-jelas bertentangan dengan kompas moralnya hanya demi bertahan hidup. Kita tak pernah membayangkan bahwa kejadian seperti itu sekarang sangat dekat dengan hidup kita. Bahkan mungkin saja kelak kita kebagian gilirannya.\n\nSeperti penutup wawancara pada umumnya, saya pun bertanya pada Arif, harapan apa yang ia punya untuk masa depannya. Dengan segudang kesibukan yang menyita waktu leha-leha di masa mudanya, saya mengira Arif akan menyebutkan harapan akan sebuah kesuksesan besar (re: kaya raya). Kemudian Arif mengatakannya, “Aku cuma pengen teman-teman aku di skena skateboard kolong sini, yang udah pada jago, bisa ikutan ngajar para pemula juga. Soalnya kan sekarang yang ngajarnya cuma dikit. Selain bisa nyetak lebih banyak pemain skateboard, lumayan juga bisa nambah-nambah pemasukan mereka. Aku juga pengen clothing aku ini lebih dikenal banyak orang. Semoga suatu saat ada orang yang bisa nge-marketingin barang dagangan aku. Biar lebih banyak dikenal orang, bukan cuma sama anak-anak di sini aja.” Arif bisa dikatakan jauh dari stereotype “punk” yang berkaitan erat dengan budaya skateboard. Tapi Arif menghidupi makna “punk”-nya sendiri. Kemudian wawancara pada malam itu berhenti sampai di situ. Arif kembali ke arena skatepark, membantu para pemula dalam bermain skateboard meski pun itu bukan jadwal mengajarnya.',
      en: 'The opening of this blog series is an introduction session with Arif, a 19-year-old who is active in the skateboarding scene at the skatepark under the Pasupati bridge in Bandung. More than just enjoying riding his board, Arif contributes to the mission of producing great skateboarders out of the “kolong”, the local name for the skatepark under Pasupati. Arif regularly teaches students of various ages, genders, and beginner-to-intermediate levels. “I teach not only for the extra money — my parents don’t support me anymore — I feel satisfied and proud when my students get it. Some were really scared at first, and now they can drop in on their own and want to try this and that trick,” Arif explains enthusiastically. Arif does come to Pasupati skatepark regularly. He is willing to help students who show up outside the lesson schedule, at no extra charge.\n\nArif usually starts his day at 5 a.m. and ends it at 11 p.m. Within those hours he has arranged his schedule so that every priority is met. He has to divide his time between social life, love, college, and the work that covers his daily needs. Beyond teaching skateboarding, Arif works part-time at a pizza restaurant and also runs a business. The business he is in is buying and selling skateboards along with their parts, streetwear clothing, and board rental priced at 15,000 rupiah per hour. The business is called TUP (Triumph Under Pressure), and he runs it with his older brother, Hadi. Besides Hadi, he also runs it with his uncle, known as Om Firman. Om Firman was the one who encouraged Arif to get to know skateboarding back when Arif was in the second year of vocational high school. Rather than just trying it, Arif decided to commit to it.\n\nHearing the whole run of Arif’s activities at his young age, I could only look back on the youth I lived without making many positive things. As he explained his principle of always prioritising what is useful for himself — in the good sense, of course — I thought that Arif is someone very far from the stereotype of the average skateboard kid, and Arif agreed with that. Take his view on cigarettes and alcohol. Amid the cigarette smoke surrounding his crew’s hangout, Arif holds firmly that cigarettes have no benefit at all for his body. He even argues that smoking would lower his performance in skateboarding and in running his packed routine. And he has never felt drawn to alcohol, again because he sees no benefit in it.\n\nBesides admiring the principles Arif holds, I also wondered whether Arif had ever grown tired of all of it? Or does he actually enjoy it? “Tired? Of course. But there is always something that gets me back on track. Besides family — because I also help their finances a little — it is always being grateful.” Okay, hearing “grateful” sounds a bit clichéd. But then Arif continued, “Not everyone can have what I have now; being able to make money from something I love. Out there a lot of people struggle to find work, and some are even forced to make money in a field they don’t like at all.” His words are simple, but they run deep, because we live in an era where, if we want to survive, our choices are not many. Out there, many people are even willing to do things that clearly contradict their moral compass just to survive. We never imagine that such things are now very close to our own lives. Perhaps one day it will be our turn.\n\nAs is usual at the end of an interview, I asked Arif what hopes he has for his future. With a mountain of commitments eating up the idle time of his youth, I assumed Arif would mention a hope for great success (re: riches). Then Arif said it, “I just want my friends in the skate scene under here, the ones who are already good, to be able to teach beginners too. Because right now there are only a few who teach. Besides producing more skateboarders, it would also add a little to their income. I also want my clothing line to be better known. Hopefully one day there will be someone who can market my merchandise. So more people know about it, not just the kids around here.” Arif could be said to be far from the “punk” stereotype so closely tied to skateboard culture. But Arif lives out his own meaning of “punk”. That night the interview stopped there. Arif went back into the skatepark, helping beginners skateboard even though it was not his teaching schedule.',
    },
    cover: {
      kind: 'photo',
      src: '/media/journal/meet-arif/thumbnail.webp',
      hint: {
        id: 'Potret Arif, pengajar skateboard di kolong Pasupati',
        en: 'Portrait of Arif, a skateboard instructor under the Pasupati flyover',
      },
    },
    inline: [
      {
        afterParagraph: 3,
        slot: {
          kind: 'photo',
          src: '/media/journal/meet-arif/inline-3.webp',
          hint: {
            id: 'Arif di skatepark kolong jembatan Pasupati',
            en: 'Arif at the skatepark under the Pasupati flyover',
          },
        },
      },
    ],
  },
];

export const partners: Partner[] = [
  {
    slug: 'tup',
    name: 'TUP Skateboard',
    intro: {
      id: 'Jual papan skateboard (baru & bekas), sewa papan, streetwear, dan les privat skateboard.',
      en: 'Skateboards (new & secondhand), board rental, streetwear, and private skateboard lessons.',
    },
    link: 'https://www.instagram.com/tup.storre/',
    logo: {
      kind: 'logo',
      src: '/images/tup-logo.webp',
      hint: { id: 'LOGO: logo TUP', en: 'LOGO: TUP logo' },
    },
  },
  {
    slug: 'sydrise',
    name: 'SYDRISE',
    intro: {
      id: 'Urang budak jaman ayeuna, tiap dinten nge-skate di Pasopati. Hayu ngahiji, hurungkeun semangatna!',
      en: "We're the youth of today, shredding daily at Pasopati Skatepark. let's unite and ignite!",
    },
    link: 'https://www.instagram.com/sydrise_/',
    logo: {
      kind: 'logo',
      src: '/images/sydrise-logo.webp',
      hint: { id: 'LOGO: logo SYDRISE', en: 'LOGO: SYDRISE logo' },
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

export const specialtyVideos: Record<
  SpecialtyKey,
  { id: string; by: string; vertical?: boolean; blurb: Local<string> }
> = {
  street: {
    id: '2qFgoSLzErA',
    by: 'Skateboarding Stories',
    vertical: true,
    blurb: {
      id: 'Street skating: main di ledge, rail, bank, dan flatground — obstacle kota, di-skate dengan kecepatan.',
      en: 'Street skating: ledges, rails, banks, and flatground — city obstacles, skated at speed.',
    },
  },
  bowl: {
    id: 'wd-VD__yTb0',
    by: 'ItzTekk',
    vertical: true,
    blurb: {
      id: 'Bowl: kolam beton dengan dinding melengkung. Jaga kecepatan, carving di dinding, cari line.',
      en: 'Bowl: a concrete pool with curved walls. Keep speed, carve the walls, find a line.',
    },
  },
  transition: {
    id: '_KgiJGjpABw',
    by: 'Zack Dowdy',
    vertical: true,
    blurb: {
      id: 'Transisi: ramp, quarter pipe, dan bank. Kamu pumping dan carving, memakai lengkungan untuk dapat udara.',
      en: 'Transition: ramps, quarter pipes, and banks. You pump and carve, using the curve to get air.',
    },
  },
};

// A discipline the coach teaches. `video` names the reference clip; without one
// the label renders as plain text.
export interface Specialty {
  label: Local<string>;
  video?: SpecialtyKey;
}

// Lesson providers. Optional listing on Home — contact details are published
// ONLY with the provider's explicit consent (see consentOn).
export interface LessonProvider {
  slug: string;
  name: string;
  age?: number; // published only if the provider wants it shown
  yearsSkating?: number;
  competition?: Local<string>; // competition experience, free text
  specialties?: Specialty[]; // e.g. Street, or Transition + Bowl
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
    specialties: [{ label: { id: 'Street', en: 'Street' }, video: 'street' }],
    partner: 'tup',
    levels: { id: 'Pemula sampai Menengah', en: 'Beginner to Intermediate' },
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
      src: '/media/coaches/arif-ajah/teaching.mp4',
      poster: '/media/coaches/arif-ajah/teaching-poster.webp',
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
    specialties: [{ label: { id: 'Street', en: 'Street' }, video: 'street' }],
    partner: 'tup',
    levels: { id: 'Pemula sampai Menengah', en: 'Beginner to Intermediate' },
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
    specialties: [
      { label: { id: 'Transisi', en: 'Transition' }, video: 'transition' },
      { label: { id: 'Bowl', en: 'Bowl' }, video: 'bowl' },
    ],
    levels: { id: 'Pemula sampai Menengah', en: 'Beginner to Intermediate' },
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
