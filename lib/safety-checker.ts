import { SafetyResult } from '@/types';

export interface SafetyInput {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  physicalCondition: 'poor' | 'average' | 'good' | 'excellent';
  plannedSeason: 'dry' | 'wet';
  weatherCondition: 'clear' | 'cloudy' | 'rainy' | 'stormy';
  mountainDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  groupSize: number;
  hasGuide: boolean;
  hasMedicalCondition: boolean;
  durationDays: number;
}

export function checkSafety(input: SafetyInput): SafetyResult {
  const { experienceLevel, physicalCondition, plannedSeason, weatherCondition, mountainDifficulty, groupSize, hasGuide, hasMedicalCondition, durationDays } = input;

  let score = 0;

  // Base scores
  if (experienceLevel === 'beginner') score += 10;
  else if (experienceLevel === 'intermediate') score += 25;
  else if (experienceLevel === 'advanced') score += 45;

  if (physicalCondition === 'poor') score += 0;
  else if (physicalCondition === 'average') score += 10;
  else if (physicalCondition === 'good') score += 20;
  else if (physicalCondition === 'excellent') score += 30;

  if (weatherCondition === 'clear') score += 25;
  else if (weatherCondition === 'cloudy') score += 18;
  else if (weatherCondition === 'rainy') score += 8;
  else if (weatherCondition === 'stormy') score += 0;

  // Modifiers
  if (hasGuide) score += 10;
  if (hasMedicalCondition) score -= 20;
  if (groupSize === 1) score -= 10;
  else if (groupSize === 2) score -= 5;
  else if (groupSize >= 4) score += 5;

  if (durationDays > 5) score -= 5;
  if (plannedSeason === 'wet') score -= 5;

  if (mountainDifficulty === 'expert' && experienceLevel === 'beginner') score -= 25;
  else if (mountainDifficulty === 'expert' && experienceLevel === 'intermediate') score -= 10;
  else if (mountainDifficulty === 'hard' && experienceLevel === 'beginner') score -= 15;

  score = Math.max(0, Math.min(100, score));

  let status: 'GO' | 'CAUTION' | 'NO-GO';

  if (weatherCondition === 'stormy' || score < 45) {
    status = 'NO-GO';
  } else if (score >= 70) {
    status = 'GO';
  } else {
    status = 'CAUTION';
  }

  const recommendations: string[] = [];
  const warnings: string[] = [];
  const improvements: string[] = [];

  if (status === 'GO') {
    recommendations.push('Perencanaan yang sangat baik. Anda siap mendaki.');
    recommendations.push('Tetap patuhi protokol keselamatan dan Leave No Trace.');
    recommendations.push('Jaga kekompakan tim selama perjalanan.');
    if (plannedSeason === 'wet') recommendations.push('Bawa perlengkapan antisipasi hujan ekstra.');
  } else if (status === 'CAUTION') {
    warnings.push('Perhatikan faktor cuaca yang mungkin tidak menentu.');
    warnings.push('Pastikan perlengkapan Anda lengkap dan berfungsi baik.');
    warnings.push('Jangan ragu untuk membatalkan pendakian jika kondisi memburuk di lapangan.');
    if (groupSize < 3) warnings.push('Karena kelompok kecil, ekstra hati-hati di jalur sepi.');
    if (experienceLevel === 'beginner' && mountainDifficulty !== 'easy') {
      warnings.push('Tingkat kesulitan gunung di atas pengalaman rata-rata tim.');
    }
  } else {
    warnings.push('Risiko sangat tinggi untuk melakukan pendakian saat ini.');
    warnings.push('Kombinasi cuaca ekstrem atau kurang persiapan dapat berakibat fatal.');
    warnings.push('Keselamatan adalah prioritas utama, jangan memaksakan diri.');
    
    improvements.push('Tunda pendakian sampai cuaca benar-benar cerah.');
    improvements.push('Lakukan latihan fisik intensif sebelum menjadwalkan ulang.');
    improvements.push('Wajib membawa guide lokal berpengalaman untuk jalur ini.');
    if (groupSize < 3) improvements.push('Tambah anggota tim minimal menjadi 4 orang.');
    if (hasMedicalCondition) improvements.push('Konsultasikan kondisi medis dengan dokter spesialis.');
  }

  return {
    status,
    score,
    recommendations,
    warnings,
    improvements
  };
}
