import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

async function run() {
  const testEnv = await initializeTestEnvironment({
    projectId: 'test-project',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') }
  });
  
  const user = testEnv.authenticatedContext('user123', {
    email: 'test@example.com'
  });
  
  const db = user.firestore();
  try {
    await setDoc(doc(db, 'profiles', 'user123'), {
      name: 'Test',
      username: '@test',
      image: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log("Success");
  } catch (e) {
    console.error("Failed:", e);
  }
  
  await testEnv.cleanup();
}
run();
