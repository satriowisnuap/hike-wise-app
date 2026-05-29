import { ItineraryDay } from '@/types';

export interface PlannerInput {
  mountainName: string;
  mountainDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  duration: number;
  members: number;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
}

export function generateItinerary(input: PlannerInput): ItineraryDay[] {
  const { mountainName, mountainDifficulty, duration, members, experienceLevel } = input;
  const itinerary: ItineraryDay[] = [];

  // Determine start times and daily max hours based on experience
  let startTime = '04:00';
  let maxHours = 8;
  if (experienceLevel === 'beginner') {
    startTime = '05:00';
    maxHours = 6;
  } else if (experienceLevel === 'advanced') {
    startTime = '03:00';
    maxHours = 10;
  }

  // Difficulty modifiers
  let addTime = 0;
  let activityNotes = '';
  if (mountainDifficulty === 'easy') {
    addTime = 30;
  } else if (mountainDifficulty === 'hard') {
    addTime = -15;
    activityNotes = 'Medan cukup teknis, perhatikan langkah kaki.';
  } else if (mountainDifficulty === 'expert') {
    addTime = -15;
    activityNotes = 'Peringatan: Persiapkan tali dan pengaman (crampon jika perlu).';
  }

  // Base warnings
  const warnings: string[] = [];
  if (experienceLevel === 'beginner' && (mountainDifficulty === 'hard' || mountainDifficulty === 'expert')) {
    warnings.push('⚠️ Tingkat kesulitan melebihi pengalaman. Pertimbangkan porter dan guide.');
  } else if (experienceLevel === 'beginner' && mountainDifficulty === 'medium') {
    warnings.push('⚠️ Disarankan membawa guide lokal.');
  }
  if (members === 1) {
    warnings.push('⚠️ Pendakian solo tidak disarankan. Minimal berdua.');
  }

  for (let day = 1; day <= duration; day++) {
    const isFirstDay = day === 1;
    const isLastDay = day === duration;
    const isSummitDay = !isFirstDay && !isLastDay && day === duration - 1; // Arbitrary summit on penultimate day
    
    // For trips less than 3 days, summit is on day 2 or day 1 if 1 day trip
    const actualSummitDay = duration === 1 ? 1 : duration === 2 ? 2 : duration - 1;
    const isActualSummitDay = day === actualSummitDay;

    let activities = [];
    let title = '';

    const dayWarnings = isFirstDay ? warnings.join(' ') : '';
    const mergedNotes = [activityNotes, dayWarnings].filter(Boolean).join(' ');

    if (duration === 1) {
      title = 'Pendakian Pulang-Pergi (Day Hike)';
      activities = [
        { time: '05:00', activity: 'Registrasi & Briefing', notes: mergedNotes, durationMinutes: 60, icon: '📋' },
        { time: '06:00', activity: `Trek Menuju Puncak ${mountainName}`, notes: 'Jaga ritme dan jangan paksakan diri.', durationMinutes: 240 + addTime, icon: '🥾' },
        { time: '10:00', activity: 'Summit & Istirahat', notes: 'Nikmati pemandangan, makan ringan.', durationMinutes: 60, icon: '🏔️' },
        { time: '11:00', activity: 'Perjalanan Turun', notes: 'Hati-hati saat turun, tumpuan lutut.', durationMinutes: 180 + addTime, icon: '⬇️' },
        { time: '14:00', activity: 'Lapor Selesai / Basecamp', notes: 'Segera melapor di pos bawah.', durationMinutes: 30, icon: '🏠' },
      ];
    } else {
      if (isFirstDay) {
        title = 'Hari Keberangkatan';
        activities = [
          { time: '07:00', activity: 'Registrasi & Briefing di Basecamp', notes: mergedNotes, durationMinutes: 90, icon: '📋' },
          { time: '08:30', activity: 'Trek Menuju Camp 1', notes: 'Pemanasan, atur langkah pelan di awal.', durationMinutes: 300 + addTime, icon: '🥾' },
          { time: '13:30', activity: 'Mendirikan Tenda & Istirahat (Camp 1)', notes: 'Bagi tugas dengan tim.', durationMinutes: 120, icon: '⛺' },
          { time: '18:00', activity: 'Makan Malam & Evaluasi', notes: 'Jaga kehangatan tubuh.', durationMinutes: 60, icon: '🍲' },
          { time: '20:00', activity: 'Istirahat / Tidur', notes: 'Persiapan untuk perjalanan esok.', durationMinutes: 480, icon: '💤' },
        ];
      } else if (isLastDay) {
        title = 'Perjalanan Pulang';
        activities = [
          { time: '06:00', activity: 'Bangun & Sarapan', notes: 'Kembalikan energi sebelum turun.', durationMinutes: 60, icon: '☕' },
          { time: '07:00', activity: 'Packing Tenda & Bersih-bersih', notes: 'Pastikan tidak ada sampah tertinggal (Leave No Trace).', durationMinutes: 60, icon: '🎒' },
          { time: '08:00', activity: 'Perjalanan Turun Menuju Basecamp', notes: 'Lutut rawan cedera, gunakan trekking pole.', durationMinutes: 240 + addTime, icon: '⬇️' },
          { time: '12:00', activity: 'Lapor Selesai & Perjalanan Pulang', notes: 'Lapor ke petugas bahwa rombongan selamat.', durationMinutes: 30, icon: '🏠' },
        ];
      } else if (isActualSummitDay) {
        title = 'Summit Day!';
        activities = [
          { time: startTime, activity: 'Alpine Start / Summit Push', notes: 'Bawa daypack berisi air, P3K, dan snack. ' + (experienceLevel === 'advanced' ? 'Alpine push.' : ''), durationMinutes: 240 + addTime, icon: '🧗' },
          { time: '06:00', activity: 'Puncak ' + mountainName, notes: 'Menikmati matahari terbit dan berfoto.', durationMinutes: 60, icon: '🏔️' },
          { time: '07:00', activity: 'Kembali ke Camp', notes: 'Segera turun sebelum panas/kabut naik.', durationMinutes: 180 + addTime, icon: '⬇️' },
          { time: '10:00', activity: 'Istirahat di Camp & Makan', notes: 'Isi kalori setelah summit.', durationMinutes: 120, icon: '🍲' },
          { time: '12:00', activity: 'Aklimatisasi / Santai Sore', notes: 'Atau lanjut packing jika akan turun parsial.', durationMinutes: 240, icon: '⛺' },
        ];
      } else {
        title = 'Trek & Aklimatisasi';
        activities = [
          { time: '06:00', activity: 'Sarapan & Packing', notes: '', durationMinutes: 120, icon: '☕' },
          { time: '08:00', activity: 'Trek ke Camp Selanjutnya', notes: 'Jaga kekompakan tim.', durationMinutes: 300 + addTime, icon: '🥾' },
          { time: '13:00', activity: 'Mendirikan Tenda Baru', notes: 'Istirahat aklimatisasi.', durationMinutes: 120, icon: '⛺' },
        ];
      }
    }

    itinerary.push({
      day,
      title,
      activities
    });
  }

  return itinerary;
}
