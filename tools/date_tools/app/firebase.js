import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, increment, setDoc, getDoc } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const firebaseConfig = {
    apiKey: "AIzaSyAgdxyNBFrwJuAnoVq6OmZKZZvRknFyVQ8",
    authDomain: "date-tool-official.firebaseapp.com",
    projectId: "date-tool-official",
    storageBucket: "date-tool-official.firebasestorage.app",
    messagingSenderId: "219114793241",
    appId: "1:219114793241:web:ee933836c68f7e712fbd88",
    measurementId: "G-ZKCJC1Y7X7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

if (typeof window !== "undefined") {
    initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider('6Ldch4ssAAAAAM0HeNiBNFlQBqXM9dUL4SNm1mxM'),
        isTokenAutoRefreshEnabled: true
    });
}

export async function initAndTrackVisit() {
    const statsRef = doc(db, "statistics", "main");
    try {
        const snap = await getDoc(statsRef);
        if (!snap.exists()) {
            await setDoc(statsRef, { visits: 1, ageCalc: 0, dateConverter: 0, durationCalc: 0 });
        } else {
            await updateDoc(statsRef, { visits: increment(1) });
        }
    } catch (error) { 
        console.warn("ملاحظة: تم تخطي تسجيل الزيارة لعدم وجود صلاحيات."); 
    }
}

export async function trackToolUsage(toolName) {
    try {
        const statsRef = doc(db, "statistics", "main");
        let updateData = {};
        updateData[toolName] = increment(1);
        await updateDoc(statsRef, updateData);
    } catch (error) { 
        console.warn("ملاحظة: تم تخطي تسجيل استخدام الأداة."); 
    }
} 