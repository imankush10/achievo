import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Goal } from "@/types";

export class GoalService {
  private static goalsCollection(userId: string) {
    return collection(db, "userProfiles", userId, "goals");
  }

  // Get all goals for a user
  static async getGoals(userId: string): Promise<Goal[]> {
    const q = query(this.goalsCollection(userId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate(),
      } as Goal;
    });
  }

  // Create a new goal for a user
  static async createGoal(userId: string, goalData: Omit<Goal, 'id'>): Promise<string> {
    const docRef = await addDoc(this.goalsCollection(userId), {
      ...goalData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  // Update an existing goal
  static async updateGoal(userId: string, goalId: string, updates: Partial<Goal>): Promise<void> {
    const goalRef = doc(this.goalsCollection(userId), goalId);
    await updateDoc(goalRef, updates);
  }

  // Delete a goal
  static async deleteGoal(userId: string, goalId: string): Promise<void> {
    const goalRef = doc(this.goalsCollection(userId), goalId);
    await deleteDoc(goalRef);
  }
}
