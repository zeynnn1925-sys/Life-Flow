import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  increment, 
  arrayUnion, 
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Habit, HabitLog } from '../types/habits';

const clean = (obj: any) => {
  const newObj = { ...obj };
  Object.keys(newObj).forEach((key) => {
    if (newObj[key] === undefined) {
      delete newObj[key];
    }
  });
  return newObj;
};

export const habitService = {
  async saveHabit(userId: string, habit: Habit) {
    const habitRef = doc(db, `users/${userId}/habits/${habit.id}`);
    await setDoc(habitRef, clean({
      ...habit,
      userId // Ensure userId is attached for rules
    }));
  },

  async deleteHabit(userId: string, habitId: string) {
    const habitRef = doc(db, `users/${userId}/habits/${habitId}`);
    await deleteDoc(habitRef);
  },

  async logHabit(userId: string, habitId: string, count: number, note?: string, mood?: number) {
    const today = new Date().toISOString().split('T')[0];
    const logId = `${habitId}_${today}`;
    const logRef = doc(db, `users/${userId}/habit_logs/${logId}`);
    const habitRef = doc(db, `users/${userId}/habits/${habitId}`);

    const logSnap = await getDoc(logRef);
    const now = Timestamp.now();

    if (logSnap.exists()) {
      await updateDoc(logRef, clean({
        completedCount: increment(count),
        completedAt: arrayUnion(now),
        note: note !== undefined ? note : logSnap.data().note,
        mood: mood !== undefined ? mood : logSnap.data().mood
      }));
    } else {
      const newLog: HabitLog = {
        id: logId,
        habitId,
        date: today,
        completedCount: count,
        completedAt: [now],
        note,
        mood: mood as any,
        skipped: false
      };
      await setDoc(logRef, clean({ ...newLog, userId }));
    }

    // Update habit stats
    // Note: Simple logic for now, more complex streak logic would ideally be here or in a function
    await updateDoc(habitRef, {
      totalCompletions: increment(count)
    });
  },

  async skipHabit(userId: string, habitId: string, note?: string) {
    const today = new Date().toISOString().split('T')[0];
    const logId = `${habitId}_${today}`;
    const logRef = doc(db, `users/${userId}/habit_logs/${logId}`);

    const logSnap = await getDoc(logRef);
    if (!logSnap.exists()) {
      const newLog: HabitLog = {
        id: logId,
        habitId,
        date: today,
        completedCount: 0,
        completedAt: [],
        note,
        skipped: true
      };
      await setDoc(logRef, clean({ ...newLog, userId }));
    } else {
      await updateDoc(logRef, clean({
        skipped: true,
        note: note || logSnap.data().note
      }));
    }
  }
};
