import { PackingCategory, PackingItem } from '@/types';

export interface PackingInput {
  duration: number;
  tripType: 'day-hike' | 'overnight' | 'expedition';
  season: 'dry' | 'wet';
  members: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

function createItem(id: string, name: string, quantity: number, unit: string, isEssential: boolean = false): PackingItem {
  return { id, name, quantity, unit, isEssential, checked: false };
}

export function generatePackingList(input: PackingInput): PackingCategory[] {
  const { duration, tripType, season, members, difficulty } = input;
  const list: PackingCategory[] = [];

  const isHardOrExpert = difficulty === 'hard' || difficulty === 'expert';
  const isOvernightOrExp = tripType === 'overnight' || tripType === 'expedition';

  // 1. Navigasi
  const navItems = [
    createItem('nav-map', 'Peta topografi', 1, 'lembar'),
    createItem('nav-compass', 'Kompas', 1, 'buah'),
    createItem('nav-whistle', 'Peluit', members, 'buah', true),
  ];
  if (tripType === 'expedition' || isHardOrExpert) navItems.push(createItem('nav-gps', 'GPS device', 1, 'unit'));
  list.push({ category: 'Navigasi', icon: '🗺️', items: navItems });

  // 2. Pakaian & Perlindungan
  const pakItems = [
    createItem('pak-shirt', 'Kaos hiking', season === 'wet' ? duration + 1 : duration, 'helai'),
    createItem('pak-pants', 'Celana hiking', Math.ceil(duration / 2), 'helai'),
    createItem('pak-wind', 'Jaket windproof', 1, 'buah'),
    createItem('pak-shoes', 'Sepatu hiking waterproof', members, 'pasang', true),
    createItem('pak-socks', 'Kaos kaki', duration + 1, 'pasang'),
  ];
  if (season === 'wet' || difficulty !== 'easy') pakItems.push(createItem('pak-rain', 'Jaket hujan/poncho', 1, 'buah'));
  if (isHardOrExpert) {
    pakItems.push(createItem('pak-buff', 'Balaclava/buff', 1, 'buah'));
    pakItems.push(createItem('pak-glove', 'Sarung tangan', 1, 'pasang'));
  }
  if (season === 'wet') pakItems.push(createItem('pak-gaiter', 'Gaiter', 1, 'pasang'));
  if (isOvernightOrExp) pakItems.push(createItem('pak-sandal', 'Sandal camp', 1, 'pasang'));
  list.push({ category: 'Pakaian & Perlindungan', icon: '👕', items: pakItems });

  // 3. Shelter & Tidur
  if (isOvernightOrExp) {
    const shelterItems = [
      createItem('sh-tent', 'Tenda', Math.ceil(members / 2), 'unit'),
      createItem('sh-sb', 'Sleeping bag', members, 'buah'),
      createItem('sh-pad', 'Sleeping pad', members, 'buah'),
    ];
    if (isHardOrExpert) shelterItems.push(createItem('sh-bivak', 'Bivak darurat', Math.ceil(members / 2), 'unit', true));
    list.push({ category: 'Shelter & Tidur', icon: '⛺', items: shelterItems });
  }

  // 4. Makanan & Air
  const foodItems = [
    createItem('fd-meal', 'Bekal makanan', Math.ceil(duration * 3 + (duration * 3 * 0.2)), 'porsi'),
    createItem('fd-snack', 'Snack energi', duration * 2, 'bungkus'),
    createItem('fd-water', 'Air minum', members * 2 * duration, 'liter'),
  ];
  if (duration > 2) foodItems.push(createItem('fd-filter', 'Water filter', 1, 'unit', true));
  if (isOvernightOrExp) {
    foodItems.push(createItem('fd-stove', 'Kompor portable', 1, 'unit'));
    foodItems.push(createItem('fd-gas', 'Gas cartridge', Math.ceil(duration / 2), 'kaleng'));
    foodItems.push(createItem('fd-pot', 'Panci/cookset', 1, 'set'));
  }
  foodItems.push(createItem('fd-spork', 'Sendok/spork', members, 'buah'));
  list.push({ category: 'Makanan & Air', icon: '🍲', items: foodItems });

  // 5. P3K & Kesehatan
  const healthItems = [
    createItem('hl-first', 'Kotak P3K dasar', 1, 'set', true),
    createItem('hl-sun', 'Sunscreen SPF50+', 1, 'botol'),
    createItem('hl-lip', 'Lip balm', 1, 'buah'),
  ];
  if (duration > 3 || tripType === 'expedition') healthItems.push(createItem('hl-advfirst', 'Obat P3K lanjutan', 1, 'set', true));
  if (difficulty === 'easy') healthItems.push(createItem('hl-bug', 'Antinyamuk', 1, 'botol'));
  if (isHardOrExpert) healthItems.push(createItem('hl-alt', 'Obat altitude sickness', 1, 'strip', true));
  list.push({ category: 'P3K & Kesehatan', icon: '⚕️', items: healthItems });

  // 6. Penerangan
  const lightItems = [
    createItem('lt-head', 'Headlamp', members, 'buah', true),
    createItem('lt-bat', 'Baterai cadangan', members * 2, 'set'),
    createItem('lt-pwb', 'Power bank', 1, 'unit'),
  ];
  list.push({ category: 'Penerangan', icon: '🔦', items: lightItems });

  // 7. Keselamatan & Survival
  const safeItems = [
    createItem('sf-ligh', 'Korek api/lighter', 2, 'buah', true),
    createItem('sf-blan', 'Emergency blanket', members, 'lembar', true),
  ];
  if (isHardOrExpert) {
    safeItems.push(createItem('sf-rope', 'Tali kernmantle 30m', 1, 'rol', true));
    safeItems.push(createItem('sf-cara', 'Carabiner', members * 2, 'buah'));
  }
  if (tripType === 'expedition') safeItems.push(createItem('sf-mirr', 'Signaling mirror', 1, 'buah'));
  list.push({ category: 'Keselamatan & Survival', icon: '🛡️', items: safeItems });

  // 8. Eco & Kebersihan
  const ecoItems = [
    createItem('ec-trash', 'Kantong sampah (Bawa turun semua sampah)', members * duration, 'lembar', true),
    createItem('ec-sani', 'Hand sanitizer', members, 'botol'),
  ];
  if (isOvernightOrExp) {
    ecoItems.push(createItem('ec-trowel', 'Trowel (Sekop kecil)', 1, 'buah'));
    ecoItems.push(createItem('ec-soap', 'Sabun biodegradable', 1, 'botol'));
  }
  if (season === 'wet') ecoItems.push(createItem('ec-dry', 'Dry bag', 2, 'buah'));
  list.push({ category: 'Eco & Kebersihan', icon: '🌿', items: ecoItems });

  // 9. Administrasi
  const adminItems = [
    createItem('ad-ktp', 'KTP/identitas', members, 'lembar', true),
    createItem('ad-izin', 'Surat izin pendakian', 1, 'lembar', true),
    createItem('ad-sar', 'Nomor darurat SAR', 1, 'catatan', true),
    createItem('ad-cash', 'Uang tunai cadangan', 1, 'bendel'),
  ];
  if (isHardOrExpert) adminItems.push(createItem('ad-ins', 'Asuransi perjalanan', members, 'lembar', true));
  list.push({ category: 'Administrasi', icon: '📋', items: adminItems });

  return list;
}
