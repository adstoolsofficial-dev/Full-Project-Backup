import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export async function initClientLayout(auth, db, currentPageId) {
    
    // 1. تحديد اسم الصفحة الحالية ديناميكياً لعرضه في الناف بار
    let pageTitleText = "بوابة المعلنين"; // الاسم الافتراضي
    if (currentPageId === 'dashboard') pageTitleText = "لوحة القيادة";
    else if (currentPageId === 'create') pageTitleText = "طلب إعلان جديد";
    else if (currentPageId === 'support') pageTitleText = "الدعم الفني";

    // 2. حقن السايد بار والناف بار والفوتر في الصفحة
    const sidebarHTML = `
        <div id="sidebarOverlay" class="sidebar-overlay"></div>
        <aside class="sidebar" id="mainSidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">
                    <i class="fa-solid fa-bullseye"></i>
                    <h2>بوابة المعلنين</h2>
                </div>
                <button class="toggle-sidebar-btn" id="toggleSidebarBtn"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <ul class="nav-links">
                <li><a href="client_dashboard.html" id="nav_dashboard"><i class="fa-solid fa-chart-pie"></i> <span class="nav-text">لوحة القيادة</span></a></li>
                <li style="display: none;"><a href="create_campaign.html" id="nav_create"><i class="fa-solid fa-plus-circle"></i> <span class="nav-text">طلب إعلان جديد</span></a></li>
                <li><a href="support.html" id="nav_support"><i class="fa-solid fa-headset"></i> <span class="nav-text">الدعم الفني</span></a></li>
            </ul>
        </aside>
    `;

    const navbarHTML = `
        <nav class="top-navbar">
            <div class="navbar-right">
                <button id="mobileMenuBtn" class="mobile-menu-btn"><i class="fa-solid fa-bars"></i></button>
                <h2 class="page-title" id="pageTitleDisplay">${pageTitleText}</h2>
            </div>
            <div class="navbar-left">
                <button id="themeToggle" class="theme-toggle-btn" title="تغيير المظهر"><i class="fa-solid fa-moon"></i></button>
                <div class="admin-profile">
                    <div class="admin-avatar"><i class="fa-solid fa-user-tie"></i></div>
                    <div class="admin-info">
                        <span class="admin-name" id="clientNameDisplay">جاري التحميل...</span>
                        <span class="admin-role" id="clientStatusDisplay">...</span>
                    </div>
                    <button id="logoutBtn" class="logout-btn" title="تسجيل الخروج"><i class="fa-solid fa-arrow-right-from-bracket"></i></button>
                </div>
            </div>
        </nav>
    `;

    const footerHTML = `
        <footer class="admin-footer">
            <div class="footer-right">جميع الحقوق محفوظة © <strong>بوابة المعلنين</strong> 2026</div>
            <div class="footer-left">نظام إدارة الإعلانات المتقدم</div>
        </footer>
    `;

    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
    const mainWrapper = document.getElementById('mainWrapper');
    if (mainWrapper) {
        mainWrapper.insertAdjacentHTML('afterbegin', navbarHTML);
        mainWrapper.insertAdjacentHTML('beforeend', footerHTML);
    }

    if (currentPageId) {
        const activeNav = document.getElementById(`nav_${currentPageId}`);
        if (activeNav) activeNav.parentElement.classList.add('active');
    }

    return new Promise((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const docRef = doc(db, "advertisers", user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const clientData = docSnap.data();

                        // تعبئة البيانات الأساسية في الناف بار دائماً
                        document.getElementById('clientNameDisplay').textContent = clientData.storeName || 'معلن مجهول';
                        document.getElementById('clientStatusDisplay').textContent = clientData.status || 'غير محدد';

                        // تفعيل نظام التبديل للوضع الداكن دائماً
                        const themeBtn = document.getElementById('themeToggle');
                        const icon = themeBtn.querySelector('i');
                        if (localStorage.getItem('theme') === 'dark') {
                            document.body.classList.add('dark-mode');
                            icon.classList.replace('fa-moon', 'fa-sun');
                        }
                        themeBtn.addEventListener('click', () => {
                            document.body.classList.toggle('dark-mode');
                            if (document.body.classList.contains('dark-mode')) {
                                localStorage.setItem('theme', 'dark');
                                icon.classList.replace('fa-moon', 'fa-sun');
                            } else {
                                localStorage.setItem('theme', 'light');
                                icon.classList.replace('fa-sun', 'fa-moon');
                            }
                        });

                        // برمجة السايد بار وتسجيل الخروج لتعمل دائماً
                        const mainSidebar = document.getElementById('mainSidebar');
                        const sidebarOverlay = document.getElementById('sidebarOverlay');
                        const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
                        const mobileMenuBtn = document.getElementById('mobileMenuBtn');

                        toggleSidebarBtn.addEventListener('click', () => {
                            mainSidebar.classList.toggle('collapsed');
                        });

                        mobileMenuBtn.addEventListener('click', () => {
                            mainSidebar.classList.add('mobile-active');
                            sidebarOverlay.classList.add('active');
                        });

                        sidebarOverlay.addEventListener('click', () => {
                            mainSidebar.classList.remove('mobile-active');
                            sidebarOverlay.classList.remove('active');
                        });

                        document.getElementById('logoutBtn').addEventListener('click', () => {
                            signOut(auth).then(() => window.location.href = 'login.html');
                        });

                        // إظهار اللوحة
                        document.body.classList.add('layout-ready');

                        // التحقق من حالة الحساب
                        if (clientData.status !== 'نشط' && clientData.status !== 'مقبول') {
                            const pageContent = document.getElementById('pageContent');
                            if (pageContent) pageContent.style.display = 'none';
                            
                            let statusIcon = clientData.status === 'مرفوض' 
                                ? '<i class="fa-solid fa-circle-xmark" style="color:#ef4444;"></i>' 
                                : '<i class="fa-solid fa-clock-rotate-left" style="color:#f59e0b;"></i>';
                            let statusColor = clientData.status === 'مرفوض' ? '#ef4444' : '#f59e0b';
                            let statusMsg = clientData.status === 'مرفوض' 
                                ? 'عذراً، تمت مراجعة طلبك واعتذار الإدارة عن قبوله في الوقت الحالي.' 
                                : 'حسابك قيد المراجعة حالياً من قبل الإدارة. يرجى الانتظار حتى يتم تفعيل حسابك لتتمكن من استخدام اللوحة بحرية.';
                            
                            const pendingHTML = `
                                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; flex-grow:1; text-align:center; padding:40px 20px; min-height: 75vh;">
                                    <div style="font-size:70px; margin-bottom:20px;">${statusIcon}</div>
                                    <h1 style="color:var(--text-main); margin-bottom:15px; font-size:26px;">حالة الحساب: <span style="color:${statusColor};">${clientData.status}</span></h1>
                                    <p style="color:var(--text-sub); font-size:16px; max-width:450px; margin-bottom:30px; line-height:1.8;">${statusMsg}</p>
                                    <a href="support.html" style="background:var(--bg-container); color:var(--text-main); border:1px solid var(--border-color); padding:10px 25px; border-radius:8px; text-decoration:none; font-weight:bold; transition:0.3s;"><i class="fa-solid fa-headset"></i> التواصل مع الدعم الفني</a>
                                </div>
                            `;
                            document.querySelector('.top-navbar').insertAdjacentHTML('afterend', pendingHTML);

                            resolve(null);
                        } else {
                            resolve(clientData);
                        }

                    } else {
                        await signOut(auth); window.location.href = 'login.html'; reject("No data");
                    }
                } catch (error) {
                    console.error("Layout Init Error: ", error);
                    reject(error);
                }
            } else {
                window.location.href = 'login.html';
            }
        });
    });
}