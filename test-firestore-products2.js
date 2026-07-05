import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';

async function run() {
  const testEnv = await initializeTestEnvironment({
    projectId: 'test-project-1234',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') }
  });
  
  const user = testEnv.authenticatedContext('user123', {
    email: 'test@example.com'
  });
  
  const db = user.firestore();
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    console.log("Success getDocs, count:", querySnapshot.size);
  } catch (e) {
    console.error("Failed:", e.message);
  }
  
  await testEnv.cleanup();
}
run();
