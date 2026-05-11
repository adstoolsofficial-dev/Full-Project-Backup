import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ⚠️ الصق رابط سكربت قوقل درايف هنا
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyxrxkEiCU6B6Vgytyd9Cw1zjfDLYgwHKsihHoeQLawuO4LeyNh7UGZgmgMrPewB51Ikg/exec";

export function initSharedAdModal(db, userInfo, onSuccessCallback) {
    if (!document.getElementById('sharedAddAdModal')) {
        const modalHTML = `
        <div id="sharedAddAdModal" class="shared-modal-overlay">
            <div class="shared-modal-content">
                <h3 class="shared-modal-header">
                    <i class="fa-solid fa-bullhorn" style="color: var(--primary-color);"></i> إنشاء حملة إعلانية مستهدفة
                </h3>
                
                <div class="shared-form-group">
                    <label class="shared-form-label"><i class="fa-solid fa-bullseye" style="color: #8b5cf6;"></i> اسم الحملة الإعلانية</label>
                    <input type="text" id="sharedCampName" class="shared-form-input" placeholder="مثال: حملة تخفيضات الصيف">
                </div>

                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <div class="shared-form-group" style="flex: 1; min-width: 200px;">
                        <label class="shared-form-label"><i class="fa-solid fa-screwdriver-wrench" style="color: #64748b;"></i> الأداة المستهدفة</label>
                        <select id="sharedCampTool" class="shared-form-input">
                            <option value="date_tool">أداة التاريخ والعمر</option>
                        </select>
                    </div>
                    <div class="shared-form-group" style="flex: 1; min-width: 200px;">
                        <label class="shared-form-label"><i class="fa-solid fa-map-location-dot" style="color: #ec4899;"></i> مكان الإعلان (المقاس المطلوب)</label>
                        <select id="sharedCampLocation" class="shared-form-input">
                            <option value="top-banner">بانر علوي رئيسي (متجاوب - AdSense)</option>
                            <option value="middle-banner">إعلان مميز (شريط وسط الصفحة - 900x120)</option>
                            <option value="bottom-banner-1">بانر سفلي 1 (نصف العرض - 400x150)</option>
                            <option value="bottom-banner-2">بانر سفلي 2 (نصف العرض - 400x150)</option>
                        </select>
                    </div>
                </div>

                <div class="shared-form-group">
                    <label class="shared-form-label"><i class="fa-solid fa-link" style="color: #0ea5e9;"></i> رابط التوجيه (URL)</label>
                    <input type="url" id="sharedCampUrl" class="shared-form-input" placeholder="https://example.com" dir="ltr" style="text-align: right;">
                </div>

                <div class="shared-form-group">
                    <label class="shared-form-label"><i class="fa-solid fa-photo-film" style="color: #f59e0b;"></i> المرفق الإعلاني (صورة، GIF، فيديو)</label>
                    <div class="shared-file-upload">
                        <input type="file" id="sharedCampFile" accept="image/*,video/mp4,video/webm">
                        <div id="sharedFileText" class="shared-file-text">
                            <i class="fa-solid fa-cloud-arrow-up" style="font-size:18px;"></i> اضغط لرفع المرفق (الحد الأقصى 5MB)
                        </div>
                    </div>
                </div>

                <div style="background: var(--bg-body); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 20px;">
                    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <div class="shared-form-group" style="flex: 1; min-width: 200px; margin-bottom: 0;">
                            <label class="shared-form-label"><i class="fa-solid fa-calendar-check" style="color: #22c55e;"></i> بداية عرض الإعلان (وقت وتاريخ)</label>
                            <input type="datetime-local" id="sharedCampStart" class="shared-form-input" dir="ltr">
                        </div>
                        <div class="shared-form-group" style="flex: 1; min-width: 200px; margin-bottom: 0;">
                            <label class="shared-form-label"><i class="fa-solid fa-calendar-xmark" style="color: #ef4444;"></i> نهاية عرض الإعلان (وقت وتاريخ)</label>
                            <input type="datetime-local" id="sharedCampEnd" class="shared-form-input" dir="ltr">
                        </div>
                    </div>
                </div>

                <div class="shared-modal-actions">
                    <button id="sharedCancelBtn" class="shared-btn-cancel">إلغاء</button>
                    <button id="sharedSaveAdBtn" class="shared-btn-submit"><i class="fa-solid fa-cloud-arrow-up"></i> رفع وحفظ الإعلان</button>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.getElementById('sharedCampFile').addEventListener('change', function() {
            const textElement = document.getElementById('sharedFileText');
            if (this.files && this.files.length > 0) {
                textElement.innerHTML = `<i class="fa-solid fa-check" style="color:#22c55e; font-size:18px;"></i> تم اختيار: ${this.files[0].name}`;
                textElement.style.color = '#22c55e';
            } else {
                textElement.innerHTML = `<i class="fa-solid fa-cloud-arrow-up" style="font-size:18px;"></i> اضغط لرفع المرفق (الحد الأقصى 5MB)`;
                textElement.style.color = 'var(--primary-color)';
            }
        });

        document.getElementById('sharedCancelBtn').addEventListener('click', () => {
            document.getElementById('sharedAddAdModal').style.display = 'none';
        });
    }

    window.openSharedAdModal = () => {
        document.getElementById('sharedAddAdModal').style.display = 'flex';
    };

    document.getElementById('sharedSaveAdBtn').onclick = async function() {
        const name = document.getElementById('sharedCampName').value.trim();
        const url = document.getElementById('sharedCampUrl').value.trim();
        const tool = document.getElementById('sharedCampTool').value;
        const location = document.getElementById('sharedCampLocation').value;
        
        // جلب التاريخ والوقت المدمج
        const rawStart = document.getElementById('sharedCampStart').value;
        const rawEnd = document.getElementById('sharedCampEnd').value;
        const fileInput = document.getElementById('sharedCampFile');
        const btn = document.getElementById('sharedSaveAdBtn');

        if(!name || !url || !rawStart || !rawEnd || fileInput.files.length === 0) {
            if(window.showCustomAlert) window.showCustomAlert('الرجاء تعبئة جميع الحقول وإرفاق الإعلان', true);
            else alert('الرجاء تعبئة جميع الحقول وإرفاق الإعلان');
            return;
        }

        const file = fileInput.files[0];
        if (file.size > 5 * 1024 * 1024) {
            if(window.showCustomAlert) window.showCustomAlert('حجم المرفق كبير جداً. الحد الأقصى 5 ميغابايت.', true);
            else alert('حجم المرفق كبير جداً. الحد الأقصى 5 ميغابايت.');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الرفع السحابي...';

        try {
            const base64Data = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result.split(',')[1]);
                reader.readAsDataURL(file);
            });

            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ filename: file.name, mimeType: file.type, base64: base64Data }),
                headers: { "Content-Type": "text/plain;charset=utf-8" }
            });
            
            const result = await response.json();
            if (result.status !== 'success') throw new Error(result.message);

            const randomId = Math.floor(100000 + Math.random() * 900000);
            
            // تحويل "YYYY-MM-DDTHH:MM" إلى شكل مقروء أكثر في الجدول (استبدال حرف T بمسافة)
            const formattedStart = rawStart.replace('T', ' ');
            const formattedEnd = rawEnd.replace('T', ' ');

            await addDoc(collection(db, "campaigns"), {
                campaignId: randomId,
                campaignName: name,
                targetUrl: url,
                imageUrl: result.fileUrl, 
                mediaType: file.type,
                targetTool: tool,
                targetLocation: location,
                startTime: formattedStart,
                endTime: formattedEnd,
                status: "نشط",
                views: 0,
                clicks: 0,
                addedByType: userInfo.role,
                addedByName: userInfo.name,
                addedById: userInfo.uid
            });

            document.getElementById('sharedAddAdModal').style.display = 'none';
            if(window.showCustomAlert) window.showCustomAlert('تم رفع الإعلان وحفظه بنجاح!');
            else alert('تم رفع الإعلان وحفظه بنجاح!');
            
            // تفريغ الحقول
            document.getElementById('sharedCampName').value = '';
            document.getElementById('sharedCampUrl').value = '';
            fileInput.value = '';
            document.getElementById('sharedFileText').innerHTML = `<i class="fa-solid fa-cloud-arrow-up" style="font-size:18px;"></i> اضغط لرفع المرفق (الحد الأقصى 5MB)`;
            document.getElementById('sharedFileText').style.color = 'var(--primary-color)';
            document.getElementById('sharedCampStart').value = '';
            document.getElementById('sharedCampEnd').value = '';

            if (onSuccessCallback) onSuccessCallback();

        } catch (error) {
            console.error(error);
            if(window.showCustomAlert) window.showCustomAlert('حدث خطأ أثناء الإضافة: ' + error.message, true);
            else alert('حدث خطأ أثناء الإضافة: ' + error.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> رفع وحفظ الإعلان';
        }
    };
}