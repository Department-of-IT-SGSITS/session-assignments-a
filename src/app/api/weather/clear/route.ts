import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

async function deleteCollection(collectionPath: string, batchSize: number) {
    const collectionRef = adminDb.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);
  
    return new Promise((resolve, reject) => {
      deleteQueryBatch(query, resolve).catch(reject);
    });
}
  
async function deleteQueryBatch(query: FirebaseFirestore.Query, resolve: (value: unknown) => void) {
    const snapshot = await query.get();
  
    const batchSize = snapshot.size;
    if (batchSize === 0) {
      // When there are no documents left, we are done
      resolve(true);
      return;
    }
  
    // Delete documents in a batch
    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  
    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
      deleteQueryBatch(query, resolve);
    });
}

export async function POST() {
    console.log("Clearing weather history job started...");
    try {
      await deleteCollection('weather', 50);
      console.log("Weather history cleared successfully.");
      return NextResponse.json({ success: true, message: 'Weather history cleared successfully.' });
    } catch (error: any) {
      console.error("Error clearing weather history:", error);
      const errorMessage = error.message || "An unknown error occurred";
      return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
    }
}
