import { collection, getDocs, query, where, addDoc, updateDoc, doc, getDoc, increment } from 'firebase/firestore';
import { db } from './firebase';
import { Timestamp } from 'firebase/firestore';
import { Trip, TrailReport, Achievement, UserAchievement, User } from '@/types';

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {id:'first-step', name:'Langkah Pertama', icon:'🥾', category:'explorer', description:'Selesaikan trip pertamamu', triggerCondition: 'first-step', isActive: true},
  {id:'mountain-hopper', name:'Mountain Hopper', icon:'🏔️', category:'explorer', description:'Kunjungi 3 gunung berbeda', triggerCondition: 'mountain-hopper', isActive: true},
  {id:'peak-collector', name:'Kolektor Puncak', icon:'🗻', category:'explorer', description:'Taklukkan 5 gunung berbeda', triggerCondition: 'peak-collector', isActive: true},
  {id:'eco-starter', name:'Eco Starter', icon:'🌱', category:'eco', description:'Buat eco log pertamamu', triggerCondition: 'eco-starter', isActive: true},
  {id:'waste-warrior', name:'Waste Warrior', icon:'♻️', category:'eco', description:'Kumpulkan 5kg sampah total', triggerCondition: 'waste-warrior', isActive: true},
  {id:'forest-guardian', name:'Penjaga Hutan', icon:'🌳', category:'eco', description:'Raih eco score 100+', triggerCondition: 'forest-guardian', isActive: true},
  {id:'team-player', name:'Tim Solid', icon:'👥', category:'explorer', description:'Trip dengan 4+ anggota', triggerCondition: 'team-player', isActive: true},
  {id:'prepared-hiker', name:'Pendaki Siap', icon:'🎒', category:'safety', description:'Buat 3 packing list', triggerCondition: 'prepared-hiker', isActive: true},
  {id:'safety-first', name:'Safety First', icon:'🛡️', category:'safety', description:'Lakukan 5 safety check', triggerCondition: 'safety-first', isActive: true},
  {id:'trail-reporter', name:'Reporter Jalur', icon:'📢', category:'community', description:'Submit 3 laporan jalur', triggerCondition: 'trail-reporter', isActive: true},
  {id:'trusted-reporter', name:'Reporter Terpercaya', icon:'⭐', category:'community', description:'Raih 5 laporan disetujui', triggerCondition: 'trusted-reporter', isActive: true},
  {id:'veteran-hiker', name:'Veteran Pendaki', icon:'🎯', category:'explorer', description:'Selesaikan 10 trip', triggerCondition: 'veteran-hiker', isActive: true}
];

export async function checkAndAwardAchievements(userId: string): Promise<string[]> {
  const newAwards: string[] = [];

  try {
    // 1. Fetch user profile
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    const userData = userSnap.exists() ? (userSnap.data() as User) : null;

    // 2. Fetch existing user achievements
    const qa = query(collection(db, 'userAchievements'), where('userId', '==', userId));
    const uaSnap = await getDocs(qa);
    const earnedAchievementIds = new Set(uaSnap.docs.map(d => d.data().achievementId));

    // 3. Use active achievements from hardcoded list
    const allAchievements = ALL_ACHIEVEMENTS.filter(a => a.isActive);
    
    // We only care about unearned ones
    const unearned = allAchievements.filter(a => !earnedAchievementIds.has(a.id));
    if (unearned.length === 0) return [];

    // 4. Fetch context data: Trips
    const qTrips = query(collection(db, 'trips'), where('userId', '==', userId), where('status', '==', 'completed'));
    const tripsSnap = await getDocs(qTrips);
    const completedTrips = tripsSnap.docs.map(d => d.data() as Trip);
    
    const uniqueMountains = new Set(completedTrips.map(t => t.mountainId));
    let totalWasteKg = 0;
    let tripsWithEcoLog = 0;
    let tripsWithSafety = 0;
    let tripsWithPacking = 0;
    
    completedTrips.forEach(t => {
      if (t.ecoLog && t.ecoLog.wasteKg > 0) {
        totalWasteKg += t.ecoLog.wasteKg;
        tripsWithEcoLog++;
      }
      if (t.safetyResult) tripsWithSafety++;
      if (t.packingList && t.packingList.length > 0) tripsWithPacking++;
    });

    // 5. Fetch context data: Reports
    const qReports = query(collection(db, 'trailReports'), where('userId', '==', userId), where('status', '==', 'approved'));
    const reportsSnap = await getDocs(qReports);
    const approvedReports = reportsSnap.docs.length;

    // Check conditions
    let addedEcoScore = 0;

    for (const ach of unearned) {
      let awarded = false;
      const tc = ach.triggerCondition;

      if (tc === 'first-step' && completedTrips.length >= 1) awarded = true;
      if (tc === 'mountain-hopper' && uniqueMountains.size >= 3) awarded = true;
      if (tc === 'peak-collector' && uniqueMountains.size >= 5) awarded = true;
      if (tc === 'eco-starter' && tripsWithEcoLog >= 1) awarded = true;
      if (tc === 'waste-warrior' && totalWasteKg >= 5) awarded = true;
      if (tc === 'forest-guardian' && userData && userData.ecoScore >= 100) awarded = true;
      if (tc === 'team-player' && completedTrips.some(t => t.members >= 4)) awarded = true;
      if (tc === 'prepared-hiker' && tripsWithPacking >= 3) awarded = true;
      if (tc === 'safety-first' && tripsWithSafety >= 5) awarded = true;
      if (tc === 'trail-reporter' && approvedReports >= 3) awarded = true;
      if (tc === 'trusted-reporter' && approvedReports >= 5) awarded = true;
      if (tc === 'veteran-hiker' && completedTrips.length >= 10) awarded = true;

      if (awarded) {
        // Award achievement
        await addDoc(collection(db, 'userAchievements'), {
          userId,
          achievementId: ach.id,
          earnedAt: Timestamp.now()
        } as UserAchievement);
        
        newAwards.push(ach.id);

        if (ach.category === 'eco') {
          addedEcoScore += 25;
        }
      }
    }

    if (addedEcoScore > 0) {
      await updateDoc(userDocRef, { ecoScore: increment(addedEcoScore) });
    }

  } catch (error) {
    console.error("Error checking achievements:", error);
  }

  return newAwards;
}
