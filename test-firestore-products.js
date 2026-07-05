import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { collection, getDocs } from 'firebase/firestore';

async function run() {
  const testEnv = await initializeTestEnvironment({
    projectId: 'test-project-123',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 }
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
