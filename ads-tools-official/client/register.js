import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, EmailAuthProvider, linkWithCredential, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);
auth.languageCode = 'ar';

// =================================================================
// ⚙️ إعدادات الإدارة (التحكم بظهور حقل الجوال)
// =================================================================
const adminSettings = {
    requirePhone: false,      // إظهار حقل الجوال وإلزام المستخدم به؟ (true أو false)
    requirePhoneOTP: false    // إظهار زر "تأكيد الجوال" للعميل؟ (true أو false)
};

// تطبيق إعدادات الإدارة على واجهة المستخدم عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    const phoneGroup = document.getElementById('dynamicPhoneGroup');
    const phoneStar = document.getElementById('phoneReqStar');
    const phoneBtn = document.getElementById('sendPhoneOtpBtn');

    if (adminSettings.requirePhone) {
        phoneGroup.style.display = 'block';
        phoneStar.style.display = 'inline';
        if (adminSettings.requirePhoneOTP) {
            phoneBtn.style.display = 'block';
        }
    }
});
// =================================================================

let isEmailVerified = false;
let isPhoneVerified = false;
let generatedEmailOTP = null;
let emailTimerInterval = null;
let alertCallback = null;

// دوال مساعدة للتنبيهات وإظهار كلمة المرور
const showAlert = (msg, type = 'error', callback = null) => {
    const modal = document.getElementById('customAlertModal');
    const icon = document.getElementById('customAlertIcon');
    const content = modal.querySelector('.modal-content');
    alertCallback = callback;

    if (type === 'success') {
        icon.innerHTML = '<i class="fa-regular fa-circle-check" style="color: #22c55e;"></i>';
        content.style.borderTopColor = '#22c55e';
    } else if (type === 'info') {
        icon.innerHTML = '<i class="fa-solid fa-circle-info" style="color: #3b82f6;"></i>';
        content.style.borderTopColor = '#3b82f6';
    } else {
        icon.innerHTML = '<i class="fa-regular fa-circle-xmark" style="color: #ef4444;"></i>';
        content.style.borderTopColor = '#ef4444';
    }
    document.getElementById('customAlertMessage').innerText = msg;
    modal.style.display = 'flex';
};

document.getElementById('alertOkBtn').addEventListener('click', () => {
    document.getElementById('customAlertModal').style.display = 'none';
    if(alertCallback) alertCallback();
});

const togglePasswordLogic = (inputId, iconElement) => {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        iconElement.classList.replace("fa-eye-slash", "fa-eye");
    } else {
        input.type = "password";
        iconElement.classList.replace("fa-eye", "fa-eye-slash");
    }
};

document.getElementById('togglePass').addEventListener('click', function() { togglePasswordLogic('password', this); });
document.getElementById('toggleConfirmPass').addEventListener('click', function() { togglePasswordLogic('confirmPassword', this); });

// حماية السيرفر من السبام
async function checkServerRateLimit(identifier) {
    const safeId = identifier.toLowerCase().replace(/[^a-z0-9@.+_-]/g, ''); 
    const limitRef = doc(db, "rate_limits", safeId);
    try {
        const docSnap = await getDoc(limitRef);
        if (docSnap.exists()) {
            const lastRequest = docSnap.data().lastRequestTime?.toDate();
            if (lastRequest) {
                const now = new Date();
                const diffSeconds = Math.floor((now - lastRequest) / 1000);
                if (diffSeconds < 60) return { allowed: false, timeLeft: 60 - diffSeconds };
            }
        }
        await setDoc(limitRef, { lastRequestTime: serverTimestamp() }, { merge: true });
        return { allowed: true };
    } catch (error) { return { allowed: true }; }
}

// معالجة البريد الإلكتروني
const emailInput = document.getElementById('email');
const emailHint = document.getElementById('emailHint');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

emailInput.addEventListener('input', () => {
    if(isEmailVerified) return; 
    if (emailInput.value.length === 0) {
        emailHint.innerText = 'يجب أن يحتوي الإيميل على علامة @ وصيغة صحيحة.';
        emailHint.className = 'hint-text';
    } else if (!emailRegex.test(emailInput.value)) {
        emailHint.innerText = 'صيغة البريد الإلكتروني غير صحيحة.';
        emailHint.className = 'hint-text hint-error';
    } else {
        emailHint.innerText = 'صيغة البريد صحيحة، يرجى الضغط على "تأكيد الإيميل".';
        emailHint.className = 'hint-text hint-success';
    }
});

document.getElementById('sendEmailOtpBtn').addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const storeName = document.getElementById('storeName').value.trim();
    const btn = document.getElementById('sendEmailOtpBtn');
    const recaptchaElement = document.querySelector('#email-recaptcha-container .g-recaptcha-response');
    
    if (!recaptchaElement) {
        showAlert('جاري تحميل نظام الحماية (الكابتشا)، يرجى الانتظار قليلاً والمحاولة مجدداً.'); return;
    }
    const recaptchaResponse = recaptchaElement.value;

    if (!emailRegex.test(email)) { showAlert('يرجى إدخال بريد إلكتروني بصيغة صحيحة.'); return; }
    if (recaptchaResponse.length === 0) { showAlert('الرجاء التأكد من أنك لست روبوتًا قبل إرسال الكود.'); return; }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحقق...';

    try {
        const advertisersRef = collection(db, "advertisers");
        const q = query(advertisersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            btn.disabled = false; btn.innerText = 'تأكيد الإيميل';
            const userStatus = querySnapshot.docs[0].data().status;
            if (userStatus === 'قيد المراجعة') {
                showAlert('عذراً، هذا البريد الإلكتروني مسجل لدينا وبانتظار المراجعة من الإدارة.');
            } else {
                showAlert('عذراً، هذا البريد الإلكتروني مسجل مسبقاً لدينا. يرجى التوجه لصفحة تسجيل الدخول.');
            }
            grecaptcha.reset(); return;
        }

        const rateLimit = await checkServerRateLimit(email);
        if (!rateLimit.allowed) {
            btn.style.display = 'none';
            let timeLeft = rateLimit.timeLeft;
            emailHint.className = 'hint-text hint-error';
            emailHint.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> طلب متكرر. يرجى الانتظار <span id="emailSpamTimer">${timeLeft}</span> ثانية`;
            
            const timer = setInterval(() => {
                timeLeft--;
                document.getElementById('emailSpamTimer').innerText = timeLeft;
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    btn.style.display = ''; btn.disabled = false; btn.innerText = 'تأكيد الإيميل';
                    emailHint.className = 'hint-text'; emailHint.innerText = 'يجب أن يحتوي الإيميل على علامة @ وصيغة صحيحة.';
                }
            }, 1000);
            return;
        }

        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الإرسال...';
        generatedEmailOTP = Math.floor(1000 + Math.random() * 9000).toString();
        const scriptURL = 'https://script.google.com/macros/s/AKfycbwRLEKsIXQ0IEFwuMs-zf59tWbyjJBtKc4eW9_sv2vCcrpXl95V7DrDjnYFRZ40vL7_pQ/exec';

        fetch(scriptURL, {
            method: 'POST',
            body: JSON.stringify({ email: email, name: storeName || "معلن جديد", otp: generatedEmailOTP, recaptchaResponse: recaptchaResponse }),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        })
        .then(response => response.json()) 
        .then(data => {
            if (data.status === "error") throw new Error(data.message || "حدث خطأ غير معروف في سيرفر الإرسال.");
            document.getElementById('emailOtpSection').style.display = 'block';
            emailInput.disabled = true;
            document.getElementById('email-recaptcha-container').style.display = 'none';
            btn.style.display = 'none';
            emailHint.className = 'hint-text hint-success';
            let timeLeft = 60;
            emailHint.innerHTML = `<i class="fa-solid fa-circle-check"></i> تم الإرسال. إعادة الطلب بعد <span id="emailSuccessTimer">${timeLeft}</span> ثانية`;
            
            const timer = setInterval(() => {
                timeLeft--; document.getElementById('emailSuccessTimer').innerText = timeLeft;
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    btn.style.display = ''; btn.disabled = false; btn.innerText = 'إعادة الإرسال';
                    grecaptcha.reset(); document.getElementById('email-recaptcha-container').style.display = 'flex';
                    emailHint.className = 'hint-text'; emailHint.innerText = 'أدخل الرمز المرسل لبريدك الإلكتروني';
                }
            }, 1000);
            
            let otpTimer = 180, minutes, seconds;
            const display = document.getElementById('emailTimerText');
            clearInterval(emailTimerInterval);
            emailTimerInterval = setInterval(() => {
                minutes = parseInt(otpTimer / 60, 10); seconds = parseInt(otpTimer % 60, 10);
                minutes = minutes < 10 ? "0" + minutes : minutes; seconds = seconds < 10 ? "0" + seconds : seconds;
                display.innerText = "الوقت المتبقي: " + minutes + ":" + seconds;
                if (--otpTimer < 0) {
                    clearInterval(emailTimerInterval);
                    display.innerText = "انتهى وقت التحقق!";
                    generatedEmailOTP = null; 
                    document.getElementById('verifyEmailOtpBtn').disabled = true;
                }
            }, 1000);
        })
        .catch((error) => {
            grecaptcha.reset(); 
            showAlert('تعذر الإرسال: ' + error.message);
            btn.disabled = false; btn.innerText = 'تأكيد الإيميل';
        });
        
    } catch (dbError) {
        btn.disabled = false; btn.innerText = 'تأكيد الإيميل';
        showAlert('حدث خطأ أثناء الاتصال بقاعدة البيانات.');
    }
});

document.getElementById('verifyEmailOtpBtn').addEventListener('click', () => {
    const inputOtp = document.getElementById('emailOtpInput').value.trim();
    if (!generatedEmailOTP) { showAlert('انتهت صلاحية الكود، قم بتحديث الصفحة والمحاولة مجدداً.'); return; }
    if (inputOtp === generatedEmailOTP) {
        isEmailVerified = true;
        clearInterval(emailTimerInterval);
        document.getElementById('emailOtpSection').style.display = 'none';
        document.getElementById('emailVerifiedIcon').style.display = 'block';
        document.getElementById('sendEmailOtpBtn').style.display = 'none'; 
        emailHint.innerText = 'تم تأكيد البريد الإلكتروني بنجاح.';
        emailHint.className = 'hint-text hint-success';
    } else {
        showAlert('رمز التحقق الخاص بالإيميل غير صحيح.');
    }
});

// معالجة كلمات المرور
const passInput = document.getElementById('password');
const passHint = document.getElementById('passwordHint');
const confirmPassInput = document.getElementById('confirmPassword');
const confirmPassHint = document.getElementById('confirmPasswordHint');
const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/; 

const checkMatch = () => {
    if (confirmPassInput.value.length === 0) {
        confirmPassHint.innerText = 'أعد كتابة كلمة المرور لتأكيدها.'; confirmPassHint.className = 'hint-text';
    } else if (passInput.value !== confirmPassInput.value) {
        confirmPassHint.innerText = 'كلمات المرور غير متطابقة!'; confirmPassHint.className = 'hint-text hint-error';
    } else {
        confirmPassHint.innerText = 'كلمات المرور متطابقة.'; confirmPassHint.className = 'hint-text hint-success';
    }
};

passInput.addEventListener('input', () => {
    if (passInput.value.length === 0) { passHint.innerText = '8 خانات، حرف كبير، صغير، ورمز خاص.'; passHint.className = 'hint-text'; } 
    else if (!passRegex.test(passInput.value)) { passHint.innerText = 'كلمة المرور ضعيفة!'; passHint.className = 'hint-text hint-error'; } 
    else { passHint.innerText = 'كلمة المرور قوية ومطابقة للشروط.'; passHint.className = 'hint-text hint-success'; }
    checkMatch(); 
});
confirmPassInput.addEventListener('input', checkMatch);

// إرسال النموذج النهائي
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const storeName = document.getElementById('storeName').value.trim();
    const accountTypeEle = document.querySelector('input[name="accountType"]:checked');
    if (!accountTypeEle) { showAlert('يرجى اختيار نوع الجهة (شركة أو فرد) للمتابعة.'); return; }
    
    const accountType = accountTypeEle.value;
    const email = emailInput.value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = passInput.value;
    const confirmPassword = confirmPassInput.value;
    const socialLink = document.getElementById('socialLink').value.trim();
    const termsCheck = document.getElementById('termsCheck').checked;

    if (!storeName || !password || !confirmPassword) { showAlert('يرجى تعبئة جميع الحقول الإجبارية (*).'); return; }
    
    // التحقق الديناميكي من الجوال بناءً على إعدادات الإدارة
    if (adminSettings.requirePhone && !phone) {
        showAlert('عفواً، رقم الجوال مطلوب لإكمال التسجيل.'); return;
    }

    if (!isEmailVerified) { showAlert('يرجى تأكيد بريدك الإلكتروني أولاً.'); return; }
    if (!passRegex.test(password)) { showAlert('كلمة المرور لا تطابق الشروط المطلوبة.'); return; }
    if (password !== confirmPassword) { showAlert('كلمتا المرور غير متطابقتين!'); return; }
    if (!termsCheck) { showAlert('يجب الموافقة على شروط الاستخدام وسياسة الخصوصية.'); return; }

    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ والإنشاء...';

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const randomNum = Math.floor(100000 + Math.random() * 900000); 
        const customId = `ddu-${randomNum}`;

        await setDoc(doc(db, "advertisers", user.uid), {
            advertiserId: customId,
            firebaseUid: user.uid,
            storeName: storeName,
            accountType: accountType,
            email: email,
            phone: adminSettings.requirePhone ? phone : "غير مطلوب", // حفظ رقم الجوال إذا كان مفعلاً
            socialLink: socialLink,
            status: "قيد المراجعة",
            createdAt: new Date().toISOString()
        });

        showAlert('تم إنشاء حسابك بنجاح! \nسيتم مراجعة طلبك من قِبل إدارة الموقع.', 'success', () => {
            window.location.href = 'login.html';
        });

    } catch (error) {
        btn.disabled = false; btn.innerHTML = 'إكمال التسجيل';
        if(error.code === 'auth/email-already-in-use') {
            showAlert('عذراً، هذا البريد الإلكتروني مسجل مسبقاً لدينا. يرجى تسجيل الدخول.');
        } else {
            showAlert("حدث خطأ في النظام: " + error.message);
        }
    }
});