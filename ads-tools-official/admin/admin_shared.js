import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export async function initAdminLayout(auth, db, currentPageId) {
    // 1. حقن السايد بار والناف بار في الصفحة
    const sidebarHTML = `
        <div id="sidebarOverlay" class="sidebar-overlay"></div>
        <aside class="sidebar" id="mainSidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">
                    <i class="fa-solid fa-layer-group"></i>
                    <h2>بوابة الإدارة</h2>
                </div>
                <button class="toggle-sidebar-btn" id="toggleSidebarBtn"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <ul class="nav-links">
                <li><a href="admin.html" id="nav_admin"><i class="fa-solid fa-house"></i> <span class="nav-text">الرئيسية</span></a></li>
                <li id="li_tickets" style="display: none;"><a href="admin_tickets.html" id="nav_tickets"><i class="fa-solid fa-headset"></i> <span class="nav-text">الدعم والتذاكر</span></a></li>
                <li id="li_ads" style="display: none;"><a href="admin_ads.html" id="nav_ads"><i class="fa-solid fa-bullhorn"></i> <span class="nav-text">إدارة الإعلانات</span></a></li>
                <li id="li_users" style="display: none;"><a href="admin_advertisers.html" id="nav_users"><i class="fa-solid fa-users-viewfinder"></i> <span class="nav-text">إدارة المعلنين</span></a></li>
                <li id="li_tools" style="display: none;"><a href="admin_tools.html" id="nav_tools"><i class="fa-solid fa-screwdriver-wrench"></i> <span class="nav-text">إدارة الأدوات</span></a></li>
                <li id="li_seo" style="display: none;"><a href="admin_seo.html" id="nav_seo"><i class="fa-solid fa-magnifying-glass-chart"></i> <span class="nav-text">أدوات السيو</span></a></li>
                
                <li id="li_server" style="display: none;"><a href="admin_server.html" id="nav_server"><i class="fa-solid fa-server" style="color: #ef4444;"></i> <span class="nav-text">إدارة الخادم</span></a></li>
                
                <li id="li_admins" style="display: none;"><a href="manage_admins.html" id="nav_admins"><i class="fa-solid fa-user-shield"></i> <span class="nav-text">المساعدين</span></a></li>
            </ul>
        </aside>
    `;

    const navbarHTML = `
        <nav class="top-nav" id="mainTopNav">
            <div class="nav-right-side">
                <button id="hamburgerBtn" class="hamburger-btn"><i class="fa-solid fa-bars"></i></button>
                <div class="admin-profile">
                    <div class="admin-avatar"><i class="fa-solid fa-user-tie"></i></div>
                    <div class="admin-info">
                        <h2 id="adminNameDisplay">مدير النظام</h2>
                        <p id="adminRoleDisplay">جاري التحميل...</p>
                    </div>
                </div>
            </div>
            <div class="nav-left-controls">
                <button id="themeToggleBtn" class="theme-toggle-btn" title="تبديل المظهر مؤقتاً"><i class="fa-solid fa-moon"></i></button>
                <button id="logoutBtnShared" class="logout-btn"><i class="fa-solid fa-arrow-right-from-bracket"></i> <span class="nav-text">خروج</span></button>
            </div>
        </nav>
    `;

    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
    document.getElementById('mainWrapper').insertAdjacentHTML('afterbegin', navbarHTML);
    
    // 🌟 كود الفوتر الموحد (يُحدث السنة تلقائياً)
    const currentYear = new Date().getFullYear();
    const footerHTML = `
        <footer class="admin-footer">
            <div>جميع الحقوق محفوظة &copy; ${currentYear} <strong>بوابة الإدارة</strong></div>
            <div class="version-badge"><i class="fa-solid fa-code-commit"></i> الإصدار 1.0.0</div>
        </footer>
    `;
    
    // ================= 5. النظام العالمي للإشعارات ونوافذ التأكيد =================
    // 1. حقن حاوية الإشعارات ونافذة التأكيد في الصفحة
    const globalUI_HTML = `
        <div id="toastContainer" class="toast-container"></div>

        <div id="globalConfirmModal" class="modal" style="z-index: 1000000;">
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <div style="font-size: 45px; color: #f59e0b; margin-bottom: 15px;"><i class="fa-solid fa-circle-exclamation"></i></div>
                <h3 id="confirmModalTitle" style="margin-top: 0;">تأكيد الإجراء</h3>
                <p id="confirmModalDesc" style="font-size: 14px; color: var(--text-sub);"></p>
                <div class="modal-actions" style="justify-content: center; margin-top: 25px;">
                    <button class="btn-cancel" onclick="document.getElementById('globalConfirmModal').style.display='none'">إلغاء</button>
                    <button class="btn-confirm" id="confirmModalBtn">نعم، متأكد</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', globalUI_HTML);

    // 2. دالة الإشعارات الأنيقة (Toast)
    window.showToast = (message, type = 'success') => {
        const container = document.getElementById('toastContainer');
        if(!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'error' ? '<i class="fa-solid fa-circle-exclamation"></i>' : '<i class="fa-solid fa-circle-check"></i>';
        toast.innerHTML = `${icon} <span>${message}</span>`;
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    };

    // 3. دالة التأكيد المخصصة (بديل لـ confirm المزعجة)
    window.showConfirm = (title, description, confirmText, confirmColor, onConfirmCallback) => {
        document.getElementById('confirmModalTitle').innerText = title;
        document.getElementById('confirmModalDesc').innerText = description;
        const btn = document.getElementById('confirmModalBtn');
        btn.innerText = confirmText;
        btn.style.backgroundColor = confirmColor; // إمكانية تغيير لون الزر (أحمر للحذف، أخضر للنجاح)
        
        document.getElementById('globalConfirmModal').style.display = 'flex';
        
        btn.onclick = () => {
            document.getElementById('globalConfirmModal').style.display = 'none';
            if(onConfirmCallback) onConfirmCallback();
        };
    };
    
    // حقن الفوتر في نهاية المحتوى الأساسي للصفحة
    document.getElementById('mainWrapper').insertAdjacentHTML('beforeend', footerHTML);

    if(currentPageId) {
        const activeLink = document.getElementById(`nav_${currentPageId}`);
        if(activeLink) activeLink.classList.add('active');
    }

    // ================= 2. منطق الوضع الداكن (يتبع نظام التشغيل دائماً) =================
    const themeBtn = document.getElementById('themeToggleBtn');
    const themeIcon = themeBtn.querySelector('i');
    const osThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // دالة لتطبيق الثيم وتغيير الأيقونة
    const applyTheme = (isDark) => {
        if (isDark) {
            document.body.classList.add('dark-mode');
            themeIcon.className = 'fa-solid fa-sun';
        } else {
            document.body.classList.remove('dark-mode');
            themeIcon.className = 'fa-solid fa-moon';
        }
    };

    // 1. تطبيق الثيم فوراً عند تحميل الصفحة بناءً على نظام التشغيل
    applyTheme(osThemeQuery.matches);

    // 2. الاستماع المباشر: تغيير الثيم فوراً إذا غير المستخدم إعدادات جهازه وهو يتصفح الموقع!
    osThemeQuery.addEventListener('change', (e) => {
        applyTheme(e.matches);
    });

    // 3. الزر يعطي إمكانية التبديل المؤقت (لا يتم حفظه، سيعود لثيم الجهاز عند التحديث)
    themeBtn.addEventListener('click', () => {
        const isDarkNow = document.body.classList.toggle('dark-mode');
        themeIcon.className = isDarkNow ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    });

    // ================= 3. منطق تصغير القائمة الجانبية وتجاوب الموبايل =================
    const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('mainSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    const savedSidebar = localStorage.getItem('admin_sidebar_collapsed');
    if(savedSidebar === 'true' && window.innerWidth > 900) {
        sidebar.classList.add('collapsed');
        document.body.classList.add('sidebar-collapsed');
    }

    toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        document.body.classList.toggle('sidebar-collapsed');
        localStorage.setItem('admin_sidebar_collapsed', sidebar.classList.contains('collapsed'));
    });

    hamburgerBtn.addEventListener('click', () => {
        sidebar.classList.add('mobile-open');
        sidebarOverlay.classList.add('active');
    });

    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        sidebarOverlay.classList.remove('active');
    });

    document.getElementById('logoutBtnShared').addEventListener('click', async () => {
        await signOut(auth);
        window.location.href = 'admin_login.html';
    });

   // ================= 4. التحقق من الصلاحيات والفايربيس =================
    return new Promise(async (resolve, reject) => {
        const user = auth.currentUser;
        if (!user) { window.location.href = 'admin_login.html'; return reject("No user"); }

        try {
            const adminDocRef = doc(db, "admins", user.uid);
            const adminDocSnap = await getDoc(adminDocRef);

            if (adminDocSnap.exists()) {
                const adminData = adminDocSnap.data();
                document.getElementById('adminNameDisplay').textContent = adminData.name || 'مدير النظام';

                if (adminData.role === 'super_admin') {
                    document.getElementById('adminRoleDisplay').textContent = 'المدير العام';
                    // إضافة 'server' إلى قائمة الصلاحيات الخاصة بالمدير العام ليتم عرضها
                    ['tickets', 'ads', 'users', 'pages', 'tools', 'seo', 'server', 'admins'].forEach(id => {
                        const el = document.getElementById(`li_${id}`);
                        if(el) el.style.display = 'block';
                    });
                } else {
                    document.getElementById('adminRoleDisplay').textContent = 'حساب مساعد';
                    if(adminData.permissions?.manage_tickets) {
                        const el = document.getElementById('li_tickets');
                        if(el) el.style.display = 'block';
                    }
                    if(adminData.permissions?.manage_ads) {
                        const el = document.getElementById('li_ads');
                        if(el) el.style.display = 'block';
                    }
                    if(adminData.permissions?.manage_tools) {
                        ['users', 'pages', 'tools', 'seo'].forEach(id => {
                            const el = document.getElementById(`li_${id}`);
                            if(el) el.style.display = 'block';
                        });
                    }
                }

                // ================= حماية الباك إند (إرسال المفتاح السري للسيرفر) =================
                // نطلب من السيرفر التحقق مما إذا كانت جلستنا مفتوحة وموثقة
                try {
                    const checkAuth = await fetch('/api/tools'); 
                    const checkData = await checkAuth.json();
                    
                    if (checkData.message && checkData.message.includes('مرفوض')) {
                        // إذا رفض السيرفر، نطلب مفتاح السيرفر من المدير
                        const serverKey = prompt('أهلاً بك في الإدارة المتقدمة.\\n\\nالرجاء إدخال "مفتاح السيرفر" (ADMIN_API_KEY) لفتح الصلاحيات الأساسية للمنصة:');
                        
                        if (serverKey) {
                            const authRes = await fetch('/api/auth-backend', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ serverKey: serverKey })
                            });
                            const authData = await authRes.json();
                            
                            if (!authData.success) {
                                alert('المفتاح خاطئ! سيتم إنهاء الجلسة لدواعي أمنية.');
                                await signOut(auth); window.location.href = 'admin_login.html'; return reject("Wrong Server Key");
                            }
                        } else {
                            await signOut(auth); window.location.href = 'admin_login.html'; return reject("No Key Provided");
                        }
                    }
                } catch(e) { console.log('تعذر الاتصال بخادم الباك إند للتحقق من الجلسة', e); }
                // ===================================================================================

                // إظهار الصفحة بالكامل بعد انتهاء التحقق وإخفاء اللودر
                document.body.classList.add('layout-ready');
                resolve(adminData);
            } else {
                await signOut(auth); window.location.href = 'admin_login.html'; reject("Not admin");
            }
        } catch (error) { await signOut(auth); window.location.href = 'admin_login.html'; reject(error); }
    });
}