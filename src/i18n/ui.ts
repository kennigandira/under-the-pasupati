export const languages = ['id', 'en'] as const;
export type Lang = (typeof languages)[number];
export const defaultLang: Lang = 'id';

export const ui = {
  id: {
    'site.title': 'Under the Pasupati',
    'site.tagline': 'Ruang publik aman tanpa kelas',
    'nav.home': 'Beranda',
    'nav.park': 'Taman',
    'nav.sotm': 'SOTM',
    'nav.journal': 'Jurnal',
    'nav.partners': 'Mitra',
    'nav.events': 'Acara',
    'nav.about': 'Tentang',
    'nav.support': 'Dukung',
    'home.latest': 'Jurnal Terbaru',
    'home.about.title': 'Tentang Skate Park Pasupati',
    'home.about.body':
      'Skatepark Pasupati menempati kolong jalan layang Pasupati di Bandung. Gratis, terbuka setiap hari, dan dipakai puluhan skater — dari yang baru pertama kali naik papan sampai senior yang main sejak taman ini dibuka.',
    'home.about.ownership':
      'Tanah dan jalan layangnya milik pemerintah kota, tapi taman ini luput dari perhatian dan pengelolaan mereka. Yang merawat, menjaga, dan menghidupkannya adalah para skater yang main di sini.',
    'home.about.cta': 'Selengkapnya soal taman',
    'home.lessons.title': 'Pengajar Skateboard',
    'home.lessons.body':
      'Ingin belajar? Kontak di bawah ini milik pengajar yang sudah setuju namanya dipublikasikan. Hubungi mereka langsung — situs ini tidak mengatur jadwal atau pembayaran.',
    'home.lessons.cta': 'Mau kontakmu dipasang di sini?',
    'coach.age': 'Umur',
    'coach.level': 'Level murid',
    'coach.specialty': 'Spesialisasi',
    'coach.specialty.video': 'Video spesialisasi',
    'coach.competition': 'Pengalaman Pertandingan',
    'coach.viewProfile': 'Lihat profil lengkap',
    'coach.media.photo': 'Foto',
    'coach.media.teaching': 'Saat Mengajar',
    'coach.media.teaching.tape': 'Sesi Mengajar',
    'coach.media.riding': 'Main Sendiri',
    'coach.media.riding.tape': 'Sesi Solo',
    'coach.contact': 'Hubungi langsung',
    'home.faq.title': 'Pertanyaan Umum',
    'home.featured': 'SOTM — Skater of the Month',
    'home.status': 'Kondisi Taman',
    'home.hero.alt': 'VIDEO: aksi skateboard pagi hari di bawah jalan layang, sudut rendah dari lantai beton',
    'park.about': 'Tentang Taman Ini',
    'park.about.body1':
      'Skatepark Pasupati ada di kolong jalan layang Pasupati, di tengah Bandung. Gratis, tanpa tiket, tanpa jam sewa: datang, turun, main.',
    'park.about.body2':
      'Tidak ada pengelola resmi. Bank, pad, dan papan manual di sini dibangun dan ditambal bergiliran oleh skater yang memakainya. Yang menyapu flatground dan mengecat ulang dinding adalah orang yang sama yang tiap sore ada di sana.',
    'park.about.body3':
      'Pagi taman ini kosong dan tenang — waktu paling aman untuk belajar. Sore jadi ramai: sesi bergantian, papan dipinjam-pinjamkan, bangku kayu dan warung penuh. Malam, lampu jalan layang yang mengambil alih.',
    'park.photos': 'Sekitar Taman',
    'park.photos.note':
      'Sisi lain taman: obstacle yang dipakai tiap hari, warung, bangku, dan dinding yang mencatat siapa saja yang pernah mampir.',
    'park.rhythm': 'Kebiasaan Main',
    'park.rhythm.note':
      'Tidak ada jadwal resmi di taman ini. Tabel ini kami susun dari pola yang berulang — siapa yang biasanya datang, dan jam berapa. Kalau mau ikut, datang saja; jamnya bisa bergeser.',
    'park.rhythm.hours': 'Jam buka',
    'park.map': 'Peta Taman',
    'park.gallery': 'Galeri Obstacle',
    'park.hero.tagline': 'Kolong jalan layang yang hidup setiap hari',
    'park.hero.scroll': 'Gulir',
    'park.gallery.note': 'Tiap obstacle punya sudut foto tetap, supaya perbandingan sebelum–sesudah konsisten.',
    'park.lastChecked': 'Terakhir dicek',
    'park.map.title': 'Lokasi Skatepark Pasupati di peta',
    'park.map.entry': 'Masuk pejalan kaki & motor',
    'park.map.entry.note': 'Parkir motor Rp2.000. Masuk lewat celah di antara warung, di bawah jalan layang.',
    'park.map.entry.alt': 'Street View: celah masuk pejalan kaki dan motor di antara warung, ditandai panah merah.',
    'park.map.car1': 'Parkir mobil · bawah flyover',
    'park.map.car1.note': 'Bayar di muka Rp10.000, lalu beri tahu petugas berapa lama kamu parkir. Masuk lewat pos jaga.',
    'park.map.car1.alt': 'Street View: jalan masuk parkir mobil di samping pos jaga, ditandai panah merah.',
    'park.map.car2': 'Parkir mobil · Baltos',
    'park.map.car2.note': 'Parkir di Baltos, lalu jalan kaki sebentar ke taman.',
    'park.map.google': 'Street View © Google',
    'park.map.open': 'Buka rute di Google Maps',
    'park.map.credit': 'Peta © kontributor OpenStreetMap',
    'park.condition': 'Catatan Kondisi',
    'park.usage': 'Rekap Penggunaan',
    'condition.ok': 'OK',
    'condition.repair': 'Perlu Perbaikan',
    'condition.hazard': 'Berbahaya',
    'sotm.title': 'SOTM',
    'sotm.subtitle':
      'Skater of the Month — dipilih juri tiap bulan dari skater yang paling konsisten hadir dan paling kelihatan progresnya.',
    'sotm.tricks': 'Trik favorit',
    'skater.age': 'Umur',
    'skater.years': 'Lama bermain',
    'skater.discipline': 'Disiplin',
    'journal.title': 'Jurnal',
    'events.upcoming': 'Akan Datang',
    'events.past': 'Arsip Acara',
    'partners.title': 'Mitra',
    'partners.by': 'by',
    'about.disclaimer': 'Situs ini adalah proyek komunitas independen dan tidak berafiliasi dengan pemerintah kota.',
    'support.soon': 'Segera hadir.',
    'support.body': 'Halaman dukungan akan dibuka setelah struktur legal dan MoU dengan kota tersedia. Belum ada donasi saat ini.',
    'media.placeholder': 'PLACEHOLDER MEDIA',
    'media.open': 'Buka layar penuh',
    'media.viewer': 'Penampil media',
    'media.close': 'Tutup',
    'ticker.facts': 'Skatepark Pasupati · Bandung · Catatan publik',
    'lang.switch': 'EN',
    'read.more': 'Baca selengkapnya',
    'post.writtenBy': 'Ditulis oleh',
    'post.share': 'Bagikan',
    'post.share.text': 'Baca di Under the Pasupati:',
    'post.translationNotice':
      'Versi bahasa Inggris artikel ini diterjemahkan oleh AI. Terbuka untuk kontributor penerjemah sukarela!',
    'share.whatsapp': 'Bagikan ke WhatsApp',
    'share.telegram': 'Bagikan ke Telegram',
    'share.facebook': 'Bagikan ke Facebook',
    'share.x': 'Bagikan ke X',
    'share.instagram': 'Bagikan ke Instagram Story',
    'share.instagram.preparing': 'Menyiapkan kartu Story…',
    'share.instagram.downloaded':
      'Kartu Story 1080×1920 diunduh, tautan disalin. Posting dari aplikasi Instagram, lalu tempel tautan di sticker tautan.',
    'share.copyFailed': 'Gagal menyalin tautan. Salin manual dari address bar.',
    'see.all': 'Lihat semua',
  },
  en: {
    'site.title': 'Under the Pasupati',
    'site.tagline': 'Recording the life of the skatepark under the Pasupati flyover, Bandung.',
    'nav.home': 'Home',
    'nav.park': 'The Park',
    'nav.sotm': 'SOTM',
    'nav.journal': 'Journal',
    'nav.partners': 'Partners',
    'nav.events': 'Events',
    'nav.about': 'About',
    'nav.support': 'Support',
    'home.latest': 'Latest from the Journal',
    'home.about.title': 'About Pasupati Skatepark',
    'home.about.body':
      'Pasupati Skatepark sits under the Pasupati flyover in Bandung. It is free, open every day, and used by dozens of skaters — from people on a board for the first time to seniors who have skated here since the park opened.',
    'home.about.ownership':
      'The land and flyover belong to the city government, but the park has slipped off its radar — unmanaged and unmaintained by the city. The skaters who ride here are the ones keeping it alive.',
    'home.about.cta': 'More about the park',
    'home.lessons.title': 'Skateboard Instructors',
    'home.lessons.body':
      'Want to learn? The contacts below belong to instructors who agreed to be listed. Reach them directly — this site handles no scheduling and no payments.',
    'home.lessons.cta': 'Want your contact listed here?',
    'coach.age': 'Age',
    'coach.level': 'Student level',
    'coach.specialty': 'Specialty',
    'coach.specialty.video': 'Specialty video',
    'coach.competition': 'Competition Experience',
    'coach.viewProfile': 'See full profile',
    'coach.media.photo': 'Photo',
    'coach.media.teaching': 'Teaching',
    'coach.media.teaching.tape': 'Teaching session',
    'coach.media.riding': 'Riding',
    'coach.media.riding.tape': 'Riding session',
    'coach.contact': 'Contact directly',
    'home.faq.title': 'FAQ',
    'home.featured': 'SOTM — Skater of the Month',
    'home.status': 'Park Status',
    'home.hero.alt': 'VIDEO: morning skate action under the flyover, low angle from the concrete floor',
    'park.about': 'About This Park',
    'park.about.body1':
      'Pasupati Skatepark sits under the Pasupati flyover, in the middle of Bandung. Free, ticketless, no hourly rate: show up, drop in, skate.',
    'park.about.body2':
      'Nobody officially runs it. The banks, pads and manual pads here were built and patched in turns by the skaters who use them. The people who sweep the flatground and repaint the walls are the same people who are here every afternoon.',
    'park.about.body3':
      'In the morning the park is empty and quiet — the safest window to learn. By late afternoon it fills up: sessions take turns, boards get passed around, and the wooden benches and the warung are full. At night the flyover lights take over.',
    'park.photos': 'Around the Park',
    'park.photos.note':
      'The other half of the park: the obstacles people ride, the warung, the benches, and the walls that track who has passed through.',
    'park.rhythm': 'Park Rhythm',
    'park.rhythm.note':
      'There is no official schedule here. This table is built from patterns that repeat — who usually shows up, and when. If you want to join, just come; the hours drift.',
    'park.rhythm.hours': 'Park hours',
    'park.map': 'Park Map',
    'park.gallery': 'Obstacle Gallery',
    'park.hero.tagline': 'The space under the flyover, alive every day',
    'park.hero.scroll': 'Scroll',
    'park.gallery.note': 'Every obstacle gets a fixed photo angle, so before/after comparisons stay consistent.',
    'park.lastChecked': 'Last checked',
    'park.map.title': 'Pasupati Skatepark location on the map',
    'park.map.entry': 'Pedestrian & motorbike entrance',
    'park.map.entry.note': 'Motorbike parking Rp2,000. Enter through the gap between the food stalls, under the flyover.',
    'park.map.entry.alt': 'Street View: the pedestrian and motorbike gap between the food stalls, marked with a red arrow.',
    'park.map.car1': 'Car parking · under the flyover',
    'park.map.car1.note': 'Pay Rp10,000 in advance, then tell the officer how long you are staying. Enter past the guard post.',
    'park.map.car1.alt': 'Street View: the car park entrance beside the guard post, marked with a red arrow.',
    'park.map.car2': 'Car parking · Baltos',
    'park.map.car2.note': 'Park at Baltos, then a short walk to the park.',
    'park.map.google': 'Street View © Google',
    'park.map.open': 'Get directions in Google Maps',
    'park.map.credit': 'Map © OpenStreetMap contributors',
    'park.condition': 'Condition Record',
    'park.usage': 'Usage Snapshot',
    'condition.ok': 'OK',
    'condition.repair': 'Needs Repair',
    'condition.hazard': 'Hazard',
    'sotm.title': 'SOTM',
    'sotm.subtitle':
      'Skater of the Month — picked by the jury each month for showing up consistently and putting in the work.',
    'sotm.tricks': 'Favourite tricks',
    'skater.age': 'Age',
    'skater.years': 'Years skating',
    'skater.discipline': 'Discipline',
    'journal.title': 'Journal',
    'events.upcoming': 'Upcoming',
    'events.past': 'Past Events',
    'partners.title': 'Partners',
    'partners.by': 'by',
    'about.disclaimer': 'This site is an independent community project and is not affiliated with the city government.',
    'support.soon': 'Coming soon.',
    'support.body': 'Support options open only after a legal fund holder and an MoU with the city exist. No donations for now.',
    'media.placeholder': 'MEDIA PLACEHOLDER',
    'media.open': 'Open full screen',
    'media.viewer': 'Media viewer',
    'media.close': 'Close',
    'ticker.facts': 'Pasupati Skatepark · Bandung · Public record · Updated monthly',
    'lang.switch': 'ID',
    'read.more': 'Read more',
    'post.writtenBy': 'Written by',
    'post.share': 'Share',
    'post.share.text': 'Read at Under the Pasupati:',
    'post.translationNotice':
      'This English version was translated by AI. Open for volunteer translator contributors!',
    'share.whatsapp': 'Share on WhatsApp',
    'share.telegram': 'Share on Telegram',
    'share.facebook': 'Share on Facebook',
    'share.x': 'Share on X',
    'share.instagram': 'Share to Instagram Story',
    'share.instagram.preparing': 'Preparing the Story card…',
    'share.instagram.downloaded':
      'Story card (1080×1920) downloaded and link copied. Post it from the Instagram app, then add the link sticker.',
    'share.copyFailed': 'Could not copy the link. Copy it from the address bar.',
    'see.all': 'See all',
  },
} as const;

export type UIKey = keyof (typeof ui)['id'];

export function t(lang: Lang, key: UIKey): string {
  return ui[lang][key] ?? ui[defaultLang][key];
}

// Single source of truth for internal URLs: Cloudflare Pages serves these as
// directories, so links must carry the trailing slash or every navigation eats
// a 308 redirect. The default language sits at the root — Indonesian is
// /journal/, English is /en/journal/.
export function localeHref(lang: Lang, path: string): string {
  return `${lang === defaultLang ? '' : `/${lang}`}${path}/`;
}

// getStaticPaths() for the [lang] pages: an undefined param drops the segment,
// which is how the default language lands on the root paths.
export function localeRoutes(): { params: { lang: Lang | undefined } }[] {
  return languages.map((lang) => ({ params: { lang: lang === defaultLang ? undefined : lang } }));
}

// Pages read the locale off that optional param; absent means the default.
export function routeLang(raw: string | undefined): Lang {
  return (languages as readonly string[]).includes(raw ?? '') ? (raw as Lang) : defaultLang;
}
