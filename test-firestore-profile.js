import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

async function run() {
  const testEnv = await initializeTestEnvironment({
    projectId: 'test-project',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: 'localhost', port: 8080 }
  });
  
  const user = testEnv.authenticatedContext('user123', {
    email: 'test@example.com'
  });
  
  const db = user.firestore();
  try {
    const profileDoc = await getDoc(doc(db, 'profiles', 'user123'));
    console.log("getDoc:", profileDoc.exists());
    
    await setDoc(doc(db, 'profiles', 'user123'), {
      name: 'Test',
      username: '@test',
      image: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log("Success setDoc");
  } catch (e) {
    console.error("Failed:", e.message);
  }
  
  await testEnv.cleanup();
}
run();
