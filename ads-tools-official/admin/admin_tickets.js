import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, query, orderBy, limit, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// استيراد العقل المدبر للواجهة
import { initAdminLayout } from './admin_shared.js';

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

let currentAdminName = "موظف مجهول";
let isSuperAdminUser = false; 
let allTickets = [];

onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const adminData = await initAdminLayout(auth, db, 'tickets');
            currentAdminName = adminData.name || 'مدير النظام';
            
            if (adminData.role === 'super_admin') isSuperAdminUser = true;

            let hasAccess = false;
            if (isSuperAdminUser || adminData.permissions?.manage_tickets) hasAccess = true;

            if (!hasAccess) {
                window.location.href = 'admin.html';
                return;
            }

            loadTicketsFromServer();
        } catch (error) {
            console.log("Error loading layout", error);
        }
    } else {
        window.location.href = 'admin_login.html';
    }
});

// ------------------ دوال التذاكر ------------------ //

async function loadTicketsFromServer() {
    try {
        const q = query(collection(db, "support_tickets"), orderBy("createdAt", "desc"), limit(50));
        const querySnapshot = await getDocs(q);
        allTickets = [];
        querySnapshot.forEach((doc) => {
            allTickets.push({ id: doc.id, ...doc.data() });
        });
        renderTable(); 
    } catch (error) {
        document.getElementById('ticketsTableBody').innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">حدث خطأ أثناء جلب البيانات. تأكد من الصلاحيات.</td></tr>`;
    }
}

function escapeHTML(str) {
    if(!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag]));
}

function renderTable() {
    const tbody = document.getElementById('ticketsTableBody');
    const fTicketNum = document.getElementById('filterTicketNum').value.toLowerCase().trim();
    const fEmail = document.getElementById('filterEmail').value.toLowerCase().trim();
    const fStatus = document.getElementById('filterStatus').value;
    const fDate = document.getElementById('filterDate').value;

    const filteredTickets = allTickets.filter(t => {
        const matchTicketNum = (t.ticketNumber || "").toLowerCase().includes(fTicketNum);
        const matchEmail = (t.senderEmail || "").toLowerCase().includes(fEmail);
        const matchStatus = fStatus === 'الكل' || t.status === fStatus;
        let matchDate = true;
        if (fDate && t.createdAt) {
            const ticketDate = t.createdAt.toDate().toISOString().split('T')[0];
            matchDate = ticketDate === fDate;
        }
        return matchTicketNum && matchEmail && matchStatus && matchDate;
    });

    tbody.innerHTML = '';

    if (filteredTickets.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-sub);">لا توجد تذاكر حالياً.</td></tr>`;
        return;
    }

    filteredTickets.forEach(ticket => {
        const dateObj = ticket.createdAt ? ticket.createdAt.toDate() : new Date();
        const dateStr = dateObj.toLocaleDateString('ar-SA') + '<br><span style="font-size:11px; color:var(--text-sub);">' + dateObj.toLocaleTimeString('ar-SA', {hour: '2-digit', minute:'2-digit'}) + '</span>';

        let badgeClass = 'status-new'; let statusText = 'جديدة';
        if(ticket.status === 'قيد المعالجة') { badgeClass = 'status-processing'; statusText = 'قيد المعالجة'; }
        else if (ticket.status === 'مكتملة') { badgeClass = 'status-resolved'; statusText = 'مكتملة'; }

        const safeMsg = escapeHTML(ticket.message);
        const shortMsg = safeMsg.length > 40 ? safeMsg.substring(0, 40) + '...' : safeMsg;
        const safeNote = escapeHTML(ticket.resolutionNote || '');
        const safeEmail = escapeHTML(ticket.senderEmail);

        const assigneeText = ticket.assignedTo ? `<span style="font-weight:bold; font-size:12px;"><i class="fa-solid fa-user-check" style="color:#f59e0b;"></i> ${escapeHTML(ticket.assignedTo)}</span>` : '<span style="color:var(--text-sub); font-size:12px;">لم تُستلم بعد</span>';

        let actionBtns = `<button class="btn-sm btn-view" onclick="openMsgModal(\`${safeMsg}\`, \`${safeNote}\`)"><i class="fa-regular fa-eye"></i> التفاصيل</button>`;
        
        if (ticket.attachedImage) {
            actionBtns += `<button class="btn-sm btn-view" onclick="openAttachmentModal('${ticket.attachedImage}')"><i class="fa-solid fa-image"></i> عرض المرفق</button>`;
        }

        if (ticket.status === 'جديدة') {
            actionBtns += `<button class="btn-sm btn-assign" onclick="assignTicket('${ticket.id}')"><i class="fa-solid fa-hand-holding-hand"></i> استلام</button>`;
        } else if (ticket.status === 'قيد المعالجة') {
            actionBtns += `<button class="btn-sm btn-resolve" onclick="openResolveModal('${ticket.id}')"><i class="fa-solid fa-check"></i> إنهاء المشكلة</button>`;
        }

        if (isSuperAdminUser) {
            actionBtns += `<button class="btn-sm" style="background:#ef4444; color:white;" onclick="deleteTicket('${ticket.id}')" title="حذف التذكرة نهائياً"><i class="fa-solid fa-trash"></i></button>`;
        }

        tbody.innerHTML += `
            <tr>
                <td>
                    <span style="font-weight:bold; color:var(--primary-color); font-size:13px; font-family: monospace;" dir="ltr">${escapeHTML(ticket.ticketNumber || '---')}</span>
                </td>
                <td>
                    <div class="client-info">
                        <span class="client-name">${escapeHTML(ticket.senderName)}</span>
                        <span class="client-email" style="cursor:pointer;" onclick="copyToClipboard('${safeEmail}')" title="نسخ البريد">${safeEmail} <i class="fa-regular fa-copy" style="font-size:10px;"></i></span>
                    </div>
                </td>
                <td style="max-width: 250px; font-size: 13px;">${shortMsg}</td>
                <td dir="ltr" style="text-align:right;">${dateStr}</td>
                <td><span class="status-badge ${badgeClass}">${statusText}</span></td>
                <td>${assigneeText}</td>
                <td><div class="action-btns">${actionBtns}</div></td>
            </tr>
        `;
    });
}

document.getElementById('filterTicketNum').addEventListener('input', renderTable);
document.getElementById('filterEmail').addEventListener('input', renderTable);
document.getElementById('filterStatus').addEventListener('change', renderTable);
document.getElementById('filterDate').addEventListener('change', renderTable);

// 🌟 دالة النسخ مع التنبيه الأنيق
window.copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    if(window.showToast) window.showToast("تم نسخ البريد الإلكتروني بنجاح", "success");
};

window.openMsgModal = (msg, note) => {
    document.getElementById('fullMessageText').textContent = msg;
    if(note) {
        document.getElementById('resolutionTextSection').style.display = 'block';
        document.getElementById('fullResolutionText').textContent = note;
    } else {
        document.getElementById('resolutionTextSection').style.display = 'none';
    }
    document.getElementById('viewMsgModal').style.display = 'flex';
};

// 🌟 دالة الاستلام مع نافذة التأكيد الاحترافية
window.assignTicket = (ticketId) => {
    if(window.showConfirm) {
        window.showConfirm(
            "استلام التذكرة",
            "هل أنت متأكد أنك تريد استلام هذه التذكرة؟ سيظهر اسمك كموظف مسؤول عنها.",
            "نعم، استلام",
            "#f59e0b",
            async () => {
                try {
                    await updateDoc(doc(db, "support_tickets", ticketId), { 
                        status: "قيد المعالجة",
                        assignedTo: currentAdminName 
                    });
                    if(window.showToast) window.showToast("تم استلام التذكرة بنجاح.", "success");
                    loadTicketsFromServer(); 
                } catch (error) {
                    if(window.showToast) window.showToast("حدث خطأ أثناء استلام التذكرة.", "error");
                }
            }
        );
    }
};

window.openResolveModal = (ticketId) => {
    document.getElementById('currentTicketIdToResolve').value = ticketId;
    document.getElementById('resolutionNote').value = '';
    document.getElementById('resolveModal').style.display = 'flex';
};

window.closeResolveModal = () => {
    document.getElementById('resolveModal').style.display = 'none';
};

// 🌟 دالة إغلاق التذكرة مع الإشعارات
window.submitResolution = async () => {
    const ticketId = document.getElementById('currentTicketIdToResolve').value;
    const note = document.getElementById('resolutionNote').value.trim();
    
    if(!note) { 
        if(window.showToast) window.showToast("يرجى كتابة ملاحظة توضح كيف تم حل المشكلة.", "error"); 
        return; 
    }
    
    try {
        await updateDoc(doc(db, "support_tickets", ticketId), { 
            status: "مكتملة",
            resolutionNote: note
        });
        closeResolveModal();
        if(window.showToast) window.showToast("تم إغلاق التذكرة بنجاح.", "success");
        loadTicketsFromServer(); 
    } catch (error) {
        if(window.showToast) window.showToast("حدث خطأ أثناء إنهاء التذكرة.", "error");
    }
};

// 🌟 دالة الحذف مع نافذة الخطر الحمراء
window.deleteTicket = (ticketId) => {
    if(window.showConfirm) {
        window.showConfirm(
            "حذف نهائي!",
            "تحذير أمني: هل أنت متأكد من رغبتك في حذف هذه التذكرة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.",
            "احذف التذكرة",
            "#ef4444",
            async () => {
                try {
                    await deleteDoc(doc(db, "support_tickets", ticketId));
                    if(window.showToast) window.showToast("تم حذف التذكرة بنجاح.", "success");
                    loadTicketsFromServer();
                } catch (error) {
                    if(window.showToast) window.showToast("خطأ: ليس لديك صلاحية الحذف، أو حدث خطأ في الشبكة.", "error");
                }
            }
        );
    }
};

function getDirectDriveLink(url) {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/) || url.match(/id=([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
            return `https://drive.google.com/file/d/${match[1]}/preview`;
        }
    }
    return url;
}

window.openAttachmentModal = (imageUrl) => {
    const directUrl = getDirectDriveLink(imageUrl);
    document.getElementById('attachedImagePreview').src = directUrl;
    document.getElementById('downloadAttachmentBtn').href = imageUrl;
    document.getElementById('viewAttachmentModal').style.display = 'flex';
};