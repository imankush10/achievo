import { https } from "firebase-functions/v1";
import * as admin from "firebase-admin";

// Initialize the Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Define interfaces for the function data
interface AcceptFriendRequestData {
  fromUid: string;
  requestId: string;
}


/**
 * Accepts a friend request.
 * - Verifies the request exists and is intended for the caller.
 * - Deletes the request document from the 'friendRequests' collection.
 * - Atomically adds each user to the other's friends list.
 * This function is callable directly from the client.
 */
export const acceptFriendRequest = https.onCall(
  async (data: unknown, context: https.CallableContext) => {
    // 1. Authentication Check
    // Ensure the user calling the function is authenticated.
    const toUid = context.auth?.uid;
    if (!toUid) {
      throw new https.HttpsError(
        "unauthenticated",
        "You must be logged in to accept a friend request."
      );
    }

    // 2. Data Validation
    // Ensure the client sent the necessary data (the user who sent the request).
    const requestData = data as AcceptFriendRequestData;
    const { fromUid, requestId } = requestData;
    if (!fromUid || !requestId) {
      throw new https.HttpsError(
        "invalid-argument",
        "The function must be called with 'fromUid' and 'requestId'."
      );
    }

    // 3. Verify the request exists and is intended for the caller
    const requestRef = db.collection("friendRequests").doc(requestId);
    const requestSnap = await requestRef.get();

    if (!requestSnap.exists) {
      throw new https.HttpsError(
        "not-found",
        "This friend request no longer exists. It may have been cancelled."
      );
    }
    
    const requestDoc = requestSnap.data()!;

    // Security check: Make sure the person accepting the request is the intended recipient.
    if (requestDoc.toUid !== toUid) {
      throw new https.HttpsError(
        "permission-denied",
        "You are not authorized to accept this friend request."
      );
    }
    // Security check: Make sure the 'fromUid' from the client matches the one in the DB.
    if (requestDoc.fromUid !== fromUid) {
         throw new https.HttpsError(
        "permission-denied",
        "Friend request data mismatch."
      );
    }

    // 4. Prepare References
    const fromUserRef = db.collection("userProfiles").doc(fromUid);
    const toUserRef = db.collection("userProfiles").doc(toUid);

    // 5. Perform Atomic Operation with a Batch
    const batch = db.batch();

    // Now it's safe to delete the request because we know it exists.
    batch.delete(requestRef);

    // Add the 'to' user to the 'from' user's friends list
    batch.update(fromUserRef, {
      friends: admin.firestore.FieldValue.arrayUnion(toUid),
    });

    // Add the 'from' user to the 'to' user's friends list
    batch.update(toUserRef, {
      friends: admin.firestore.FieldValue.arrayUnion(fromUid),
    });

    // 6. Commit the Batch
    // This will either succeed completely or fail completely.
    await batch.commit();

    return { success: true, message: "Friend request accepted." };
  }
);
