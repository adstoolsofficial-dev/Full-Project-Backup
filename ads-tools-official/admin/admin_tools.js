/**
 * ======================================================================
 * 📦 1. المتغيرات العامة (GLOBAL STATE)
 * ======================================================================
 * هنا يتم تخزين حالة التطبيق الحالية (المشروع المفتوح، البيانات، الملفات المرفوعة)
 */
let currentToolFolder = '';
let toolConfigData = { customPages: {}, pages: {}, mainSEO: {}, externalLinks: [], socialMedia: [] }; 

let uploadedLogoBase64 = null;
let uploadedLogoExt = '';

let uploadedFaviconBase64 = null;
let uploadedFaviconExt = '';

let editorCurrentTarget = ''; 
let editorCurrentType = '';
let foundCorePaths = []; 


/**
 * ======================================================================
 * 🌐 2. دوال الاتصال بالسيرفر الأساسية (CORE API)
 * ======================================================================
 */
async function saveConfigToServerSilent() {
    await fetch('/api/save-file', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: currentToolFolder + '/config.json', content: JSON.stringify(toolConfigData, null, 4) })
    });
}


/**
 * ======================================================================
 * 📂 3. إدارة المشاريع (PROJECT MANAGEMENT)
 * ======================================================================
 * دوال جلب المشاريع، الدخول لمشروع، والعودة للقائمة
 */
window.loadFolders = async () => {
    const grid = document.getElementById('itemsGrid');
    grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-sub);"><i class="fa-solid fa-spinner fa-spin"></i> جاري جلب المشاريع...</div>';

    try {
        const response = await fetch('/api/tools');
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            let htmlContent = '';
            for (const folderName of result.data) {
                let toolDisplayName = folderName;
                let hasLogo = false;
                let exactLogoFile = 'logo.png'; 
                
                try {
                    const configRes = await fetch(`/tools/${folderName}/config.json?t=${Date.now()}`);
                    if (configRes.ok) {
                        const config = await configRes.json();
                        if (config.hasLogo) hasLogo = true;
                        if (config.toolDisplayName) toolDisplayName = config.toolDisplayName;
                        if (config.logoFile) exactLogoFile = config.logoFile; 
                    }
                } catch (e) {} 

                let iconHtml = hasLogo 
                    ? `<img src="/tools/${folderName}/${exactLogoFile}?t=${Date.now()}" class="tool-logo" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='block';" />
                       <i class="fa-solid fa-folder-open item-icon" style="display:none; color:#3b82f6;"></i>` 
                    : `<i class="fa-solid fa-folder-open item-icon" style="color:#3b82f6;"></i>`;

                htmlContent += `
                    <div class="item-card" onclick="openToolDetail('${folderName}')">
                        ${iconHtml}
                        <div class="item-title">${toolDisplayName}</div>
                        <div class="item-subtitle" dir="ltr">/tools/${folderName}</div>
                    </div>
                `;
            }
            grid.innerHTML = htmlContent;
        } else {
            grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-sub);">لا توجد مشاريع حالياً. أنشئ مشروعاً جديداً.</div>';
        }
    } catch (error) { 
        grid.innerHTML = `<div style="grid-column: 1 / -1; color: #ef4444; text-align: center;">فشل الاتصال بالسيرفر.</div>`; 
    }
};

window.openToolDetail = async (folderName) => {
    currentToolFolder = folderName;
    
    // تصفير المتغيرات عند فتح أداة جديدة
    uploadedLogoBase64 = null; uploadedFaviconBase64 = null;
    uploadedLogoExt = ''; uploadedFaviconExt = ''; 
    toolConfigData = { customPages: {}, pages: {}, mainSEO: {}, externalLinks: [], socialMedia: [] };
    
    document.getElementById('logoUploadInput').value = ''; document.getElementById('faviconUploadInput').value = '';
    document.getElementById('viewToolsList').style.display = 'none';
    document.getElementById('viewToolDetail').style.display = 'block';
    document.getElementById('headerToolName').innerText = folderName;
    document.getElementById('headerToolPath').innerText = `/tools/${folderName}`;

    // تصفير الحقول
    document.getElementById('globalToolName').value = ''; document.getElementById('globalToolSlogan').value = ''; document.getElementById('globalCopyright').value = ''; document.getElementById('globalDomain').value = ''; document.getElementById('globalContactEmail').value = '';
    document.getElementById('mainSeoTitle').value = ''; document.getElementById('mainSeoDesc').value = ''; document.getElementById('mainSeoKeywords').value = ''; document.getElementById('mainSeoScripts').value = '';
    
    const imgPreview = document.getElementById('previewLogo'); const uploadBox = document.getElementById('customUploadBox');
    imgPreview.style.display = 'none'; imgPreview.src = ''; uploadBox.classList.remove('has-image'); document.getElementById('uploadLabelText').innerText = 'اختيار صورة';

    const imgPreviewFav = document.getElementById('previewFavicon'); const uploadBoxFav = document.getElementById('customUploadBoxFavicon');
    imgPreviewFav.style.display = 'none'; imgPreviewFav.src = ''; uploadBoxFav.classList.remove('has-image'); document.getElementById('uploadLabelTextFavicon').innerText = 'اختيار أيقونة';

    try {
        const configRes = await fetch(`/tools/${folderName}/config.json?t=${Date.now()}`);
        if (configRes.ok) {
            const loadedConfig = await configRes.json();
            toolConfigData = { ...toolConfigData, ...loadedConfig };
            
            // التأكد من وجود الهياكل الأساسية في الكونفق
            if(!toolConfigData.customPages) toolConfigData.customPages = {}; 
            if(!toolConfigData.pages) toolConfigData.pages = {}; 
            if(!toolConfigData.mainSEO) toolConfigData.mainSEO = {}; 
            if(!toolConfigData.externalLinks) toolConfigData.externalLinks = [];
            if(!toolConfigData.socialMedia) toolConfigData.socialMedia = [];
            
            document.getElementById('globalToolName').value = toolConfigData.toolDisplayName || '';
            document.getElementById('globalToolSlogan').value = toolConfigData.toolSlogan || ''; 
            document.getElementById('globalCopyright').value = toolConfigData.copyright || '';
            document.getElementById('globalDomain').value = toolConfigData.toolDomain || '';
            document.getElementById('globalContactEmail').value = toolConfigData.contactEmail || '';
            
            document.getElementById('mainSeoTitle').value = toolConfigData.mainSEO.title || '';
            document.getElementById('mainSeoDesc').value = toolConfigData.mainSEO.description || '';
            document.getElementById('mainSeoKeywords').value = toolConfigData.mainSEO.keywords || '';
            document.getElementById('mainSeoScripts').value = toolConfigData.mainSEO.headerScripts || '';

            if(toolConfigData.hasLogo) {
                const exactName = toolConfigData.logoFile || 'logo.png';
                imgPreview.src = `/tools/${folderName}/${exactName}?t=${Date.now()}`;
                imgPreview.onerror = function() { this.style.display = 'none'; };
                imgPreview.style.display = 'block'; uploadBox.classList.add('has-image'); document.getElementById('uploadLabelText').innerText = 'تغيير الصورة';
            }
            if(toolConfigData.hasFavicon) {
                const exactName = toolConfigData.faviconFile || 'favicon.png';
                imgPreviewFav.src = `/tools/${folderName}/${exactName}?t=${Date.now()}`;
                imgPreviewFav.onerror = function() { this.style.display = 'none'; };
                imgPreviewFav.style.display = 'block'; uploadBoxFav.classList.add('has-image'); document.getElementById('uploadLabelTextFavicon').innerText = 'تغيير الأيقونة';
            }
        }
    } catch (e) {}

    renderFilesAndPages();
    renderSocialMedia(); 
};

window.goBackToList = () => {
    document.getElementById('viewToolDetail').style.display = 'none';
    document.getElementById('viewToolsList').style.display = 'block';
    loadFolders();
};


/**
 * ======================================================================
 * 🎨 4. التعامل مع الصور والمرفقات (MEDIA HANDLING)
 * ======================================================================
 */
window.previewUploadedLogo = (e) => { 
    const f = e.target.files[0]; 
    if(!f) return; 
    uploadedLogoExt = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
    const r = new FileReader(); 
    r.onload = (ev) => { 
        uploadedLogoBase64 = ev.target.result; 
        document.getElementById('previewLogo').src = uploadedLogoBase64; 
        document.getElementById('previewLogo').style.display = 'block'; 
        document.getElementById('customUploadBox').classList.add('has-image'); 
    }; 
    r.readAsDataURL(f); 
};

window.previewUploadedFavicon = (e) => { 
    const f = e.target.files[0]; 
    if(!f) return; 
    uploadedFaviconExt = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
    const r = new FileReader(); 
    r.onload = (ev) => { 
        uploadedFaviconBase64 = ev.target.result; 
        document.getElementById('previewFavicon').src = uploadedFaviconBase64; 
        document.getElementById('previewFavicon').style.display = 'block'; 
        document.getElementById('customUploadBoxFavicon').classList.add('has-image'); 
    }; 
    r.readAsDataURL(f); 
};


/**
 * ======================================================================
 * 💾 5. حفظ الإعدادات (SAVING SETTINGS)
 * ======================================================================
 */
window.saveGlobalSettings = async () => {
    const btn = document.getElementById('saveGlobalBtn'); const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...'; btn.disabled = true;

    try {
        if (uploadedLogoBase64) {
            const fName = 'logo' + uploadedLogoExt;
            await fetch('/api/add-file', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPath: currentToolFolder, fileName: fName, isUpload: true, contentBase64: uploadedLogoBase64 }) });
            toolConfigData.hasLogo = true; toolConfigData.logoFile = fName;
            uploadedLogoBase64 = null; uploadedLogoExt = '';
        }
        if (uploadedFaviconBase64) {
            const fName = 'favicon' + uploadedFaviconExt;
            await fetch('/api/add-file', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPath: currentToolFolder, fileName: fName, isUpload: true, contentBase64: uploadedFaviconBase64 }) });
            toolConfigData.hasFavicon = true; toolConfigData.faviconFile = fName;
            uploadedFaviconBase64 = null; uploadedFaviconExt = '';
        }

        toolConfigData.toolDisplayName = document.getElementById('globalToolName').value.trim();
        toolConfigData.toolSlogan = document.getElementById('globalToolSlogan').value.trim(); 
        toolConfigData.copyright = document.getElementById('globalCopyright').value.trim();
        toolConfigData.toolDomain = document.getElementById('globalDomain').value.trim();
        toolConfigData.contactEmail = document.getElementById('globalContactEmail').value.trim();

        await saveConfigToServerSilent();
        btn.innerHTML = '<i class="fa-solid fa-check"></i> تم الحفظ'; btn.style.backgroundColor = '#10b981';
        setTimeout(() => { btn.innerHTML = orig; btn.style.backgroundColor = 'var(--primary-color)'; btn.disabled = false; }, 2000);
    } catch (e) { btn.innerHTML = orig; btn.disabled = false; showToast('حدث خطأ أثناء الحفظ', 'error'); }
};

window.saveMainSeoSettings = async () => {
    const btn = document.getElementById('saveSeoBtn'); const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...'; btn.disabled = true;

    toolConfigData.mainSEO.title = document.getElementById('mainSeoTitle').value.trim();
    toolConfigData.mainSEO.description = document.getElementById('mainSeoDesc').value.trim();
    toolConfigData.mainSEO.keywords = document.getElementById('mainSeoKeywords').value.trim();
    toolConfigData.mainSEO.headerScripts = document.getElementById('mainSeoScripts').value.trim();

    try {
        await saveConfigToServerSilent();
        btn.innerHTML = '<i class="fa-solid fa-check"></i> تم حفظ الـ SEO'; btn.style.backgroundColor = '#10b981';
        setTimeout(() => { btn.innerHTML = orig; btn.style.backgroundColor = '#c026d3'; btn.disabled = false; }, 2000);
    } catch (e) { showToast('خطأ', 'error'); btn.innerHTML = orig; btn.disabled = false; }
};


/**
 * ======================================================================
 * 📄 6. إدارة الصفحات والملفات (PAGES & FILES MANAGEMENT)
 * ======================================================================
 */
window.renderFilesAndPages = async () => {
    const sysContainer = document.getElementById('systemFilesContainer');
    const contentContainer = document.getElementById('customPagesContainer');
    
    sysContainer.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري البحث في السيرفر...';
    contentContainer.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري البحث في السيرفر...';

    let sysHtml = '';
    let contentHtml = '';
    foundCorePaths = [];
    let rootFiles = [];
    let appFiles = [];

    // جلب ملفات السيرفر
    try {
        const rootRes = await fetch(`/api/files?path=${currentToolFolder}`);
        if (rootRes.ok) rootFiles = (await rootRes.json()).data?.map(f => f.name) || [];
    } catch(e){}

    try {
        const appRes = await fetch(`/api/files?path=${currentToolFolder}/app`);
        if (appRes.ok) appFiles = (await appRes.json()).data?.map(f => f.name) || [];
    } catch(e){}

    // 1. ملفات النظام
    const essentialFiles = [
        { path: 'app/page.jsx', tsxPath: 'app/page.tsx', alt: 'index.html', title: 'الصفحة الأساسية للمشروع', icon: 'fa-react', color: '#3b82f6' },
        { path: 'app/globals.css', alt: 'style.css', title: 'صفحة التصميم (الستايل)', icon: 'fa-css3-alt', color: '#0ea5e9' },
        { path: 'app/layout.jsx', tsxPath: 'app/layout.tsx', alt: 'layout.html', title: 'صفحة الهيكل (لإضافة التاقات)', icon: 'fa-code', color: '#8b5cf6' }
    ];

    for (const fileDef of essentialFiles) {
        let foundPath = null;
        const getFileName = (fullPath) => fullPath ? fullPath.split('/').pop() : '';

        if (appFiles.includes(getFileName(fileDef.path))) foundPath = fileDef.path;
        else if (fileDef.tsxPath && appFiles.includes(getFileName(fileDef.tsxPath))) foundPath = fileDef.tsxPath;
        else if (rootFiles.includes(fileDef.alt)) foundPath = fileDef.alt;

        if(foundPath) {
            foundCorePaths.push(foundPath);
            sysHtml += `
                <div class="page-card" style="align-items: center; border-right: 4px solid ${fileDef.color};">
                    <div class="page-info">
                        <i class="fa-brands ${fileDef.icon} page-icon" style="color: ${fileDef.color};"></i>
                        <div>
                            <div style="font-weight: bold; color: var(--text-main); font-size: 15px;">${fileDef.title}</div>
                            <div style="font-size: 12px; color: var(--text-sub);" dir="ltr">${foundPath}</div>
                        </div>
                    </div>
                    <div class="page-actions file-actions-group">
                        <button class="btn-primary" onclick="openEditor('system', '${foundPath}')" style="font-size:12px; padding:6px 15px; background:${fileDef.color};"><i class="fa-solid fa-code"></i> تعديل الكود</button>
                    </div>
                </div>
            `;
        }
    }
    sysContainer.innerHTML = sysHtml !== '' ? sysHtml : '<div style="text-align:center; color:#94a3b8; padding:20px;">لم يتم العثور على ملفات النظام الأساسية.</div>';

    // 2. الروابط الخارجية
    if (toolConfigData.externalLinks && toolConfigData.externalLinks.length > 0) {
        toolConfigData.externalLinks.forEach((link, index) => {
            contentHtml += `
                <div class="page-card" style="align-items: center; border-right: 4px solid #0ea5e9; background: #f0f9ff;">
                    <div class="page-info">
                        <i class="fa-solid fa-arrow-up-right-from-square page-icon" style="color: #0ea5e9;"></i>
                        <div style="flex-grow: 1;">
                            <input type="text" class="inline-title-input" value="${link.title}" onchange="updateExternalLinkTitle(${index}, this.value)" placeholder="اسم الرابط">
                            <div style="font-size: 12px; color: var(--text-sub);" dir="ltr">${link.url}</div>
                        </div>
                    </div>
                    <div class="page-actions file-actions-group">
                        <span style="font-size:11px; color:var(--text-sub);">المكان:</span>
                        <select class="location-select" onchange="updateExternalLinkLocation(${index}, this.value)">
                            <option value="footer" ${link.location==='footer'?'selected':''}>في الفوتر</option>
                            <option value="header" ${link.location==='header'?'selected':''}>في الهيدر</option>
                            <option value="both" ${link.location==='both'?'selected':''}>هيدر وفوتر</option>
                        </select>
                        <button class="btn-secondary" onclick="deleteExternalLink(${index})" style="font-size:12px; padding:6px 10px; color:#ef4444;"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
    }

    // 3. صفحات المحتوى الحقيقية
    rootFiles.forEach(fileName => {
        if ((fileName.endsWith('.html') || fileName.endsWith('.php') || fileName.endsWith('.jsx')) && !foundCorePaths.includes(fileName)) {
            contentHtml += buildContentPageCard(fileName, fileName.split('.')[0]);
        }
    });

    try {
        const appFoldersRes = await fetch(`/api/files?path=${currentToolFolder}/app`);
        if(appFoldersRes.ok) {
            const appFoldersData = await appFoldersRes.json();
            if(appFoldersData.success) {
                for(let f of appFoldersData.data) {
                    if(f.isDirectory && !['api','components','fonts','lib','assets','styles'].includes(f.name)) {
                        try {
                            const subRes = await fetch(`/api/files?path=${currentToolFolder}/app/${f.name}`);
                            if (subRes.ok) {
                                const subFiles = (await subRes.json()).data?.map(sf => sf.name) || [];
                                let pagePath = null;
                                if (subFiles.includes('page.jsx')) pagePath = `app/${f.name}/page.jsx`;
                                else if (subFiles.includes('page.tsx')) pagePath = `app/${f.name}/page.tsx`;

                                if(pagePath && !foundCorePaths.includes(pagePath)) {
                                    contentHtml += buildContentPageCard(pagePath, f.name);
                                }
                            }
                        } catch(e){}
                    }
                }
            }
        }
    } catch(e){}

    // 4. الصفحات الافتراضية
    Object.keys(toolConfigData.customPages || {}).forEach(slug => {
        const pd = toolConfigData.customPages[slug];
        const loc = pd.location || 'footer';
        contentHtml += `
            <div class="page-card" style="align-items: center; border-right: 4px solid #16a34a; opacity: 0.8;">
                <div class="page-info">
                    <i class="fa-solid fa-file-alt page-icon" style="color: #16a34a;"></i>
                    <div style="flex-grow: 1;">
                        <input type="text" class="inline-title-input" value="${pd.title}" onchange="updateVirtualPageTitle('${slug}', this.value)" placeholder="اسم الصفحة">
                        <div style="font-size: 12px; color: var(--text-sub);" dir="ltr">/${slug} (قديمة)</div>
                    </div>
                </div>
                <div class="page-actions file-actions-group">
                    <span style="font-size:11px; color:var(--text-sub);">مكان العرض:</span>
                    <select class="location-select" onchange="updateVirtualPageLocation('${slug}', this.value)">
                        <option value="footer" ${loc==='footer'?'selected':''}>في الفوتر</option>
                        <option value="header" ${loc==='header'?'selected':''}>في الهيدر</option>
                        <option value="both" ${loc==='both'?'selected':''}>هيدر وفوتر</option>
                        <option value="hidden" ${loc==='hidden'?'selected':''}>مخفية</option>
                    </select>
                    <button class="btn-primary" onclick="openEditor('virtual', '${slug}')" style="font-size:12px; padding:6px 12px; background:#16a34a;"><i class="fa-solid fa-pen"></i> المحتوى</button>
                    <button class="btn-secondary" onclick="deleteVirtualPage('${slug}')" style="font-size:12px; padding:6px 10px; color:#ef4444;"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    });

    contentContainer.innerHTML = contentHtml !== '' ? contentHtml : '<div style="text-align:center; color:#94a3b8; padding: 20px;">لا توجد صفحات أو روابط مضافة حالياً.</div>';
};

const buildContentPageCard = (filePath, slugForTitle) => {
    let loc = toolConfigData.pages?.[filePath]?.location || 'hidden';
    let displayTitle = toolConfigData.pages?.[filePath]?.title || slugForTitle;

    return `
        <div class="page-card" style="align-items: center; border-right: 4px solid #16a34a;">
            <div class="page-info">
                <i class="fa-solid fa-file-code page-icon" style="color: #16a34a;"></i>
                <div style="flex-grow: 1;">
                    <input type="text" class="inline-title-input" value="${displayTitle}" onchange="updatePhysicalPageTitle('${filePath}', this.value)" placeholder="اسم الصفحة">
                    <div style="font-size: 12px; color: var(--text-sub);" dir="ltr">${filePath}</div>
                </div>
            </div>
            <div class="page-actions file-actions-group">
                <span style="font-size:11px; color:var(--text-sub);">مكان العرض:</span>
                <select class="location-select" onchange="updatePhysicalPageLocation('${filePath}', this.value)">
                    <option value="footer" ${loc==='footer'?'selected':''}>في الفوتر</option>
                    <option value="header" ${loc==='header'?'selected':''}>في الهيدر</option>
                    <option value="both" ${loc==='both'?'selected':''}>هيدر وفوتر</option>
                    <option value="hidden" ${loc==='hidden'?'selected':''}>مخفية</option>
                </select>
                <button class="btn-primary" onclick="openEditor('system', '${filePath}')" style="font-size:12px; padding:6px 12px; background:#16a34a;"><i class="fa-solid fa-code"></i> الكود</button>
                <button class="btn-secondary" onclick="deletePhysicalPage('${filePath}')" style="font-size:12px; padding:6px 10px; color:#ef4444;"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `;
};

// دوال تحديث خصائص الصفحات
window.updatePhysicalPageTitle = (filePath, newTitle) => {
    if(!toolConfigData.pages) toolConfigData.pages = {};
    if(!toolConfigData.pages[filePath]) toolConfigData.pages[filePath] = {};
    toolConfigData.pages[filePath].title = newTitle;
    saveConfigToServerSilent();
};
window.updateVirtualPageTitle = (slug, newTitle) => {
    if(toolConfigData.customPages && toolConfigData.customPages[slug]) {
        toolConfigData.customPages[slug].title = newTitle;
        saveConfigToServerSilent();
    }
};
window.updatePhysicalPageLocation = (filePath, newLocation) => {
    if(!toolConfigData.pages) toolConfigData.pages = {};
    if(!toolConfigData.pages[filePath]) toolConfigData.pages[filePath] = {};
    toolConfigData.pages[filePath].location = newLocation;
    saveConfigToServerSilent();
};
window.updateVirtualPageLocation = (slug, newLocation) => {
    toolConfigData.customPages[slug].location = newLocation;
    saveConfigToServerSilent();
};

// دوال الحذف والإنشاء
window.deleteVirtualPage = async (slug) => {
    if(confirm(`هل أنت متأكد من الحذف؟`)) { 
        delete toolConfigData.customPages[slug]; 
        await saveConfigToServerSilent(); 
        renderFilesAndPages(); 
    }
};
window.deletePhysicalPage = async (filePath) => {
    if(confirm(`هل أنت متأكد من الحذف الجذري نهائياً من السيرفر؟`)){
        try {
            let pathToDelete = filePath.startsWith('app/') && (filePath.endsWith('/page.jsx') || filePath.endsWith('/page.tsx')) 
                ? filePath.substring(0, filePath.lastIndexOf('/')) 
                : filePath;

            await fetch('/api/delete-item', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemPath: currentToolFolder + '/' + pathToDelete }) });
            if(toolConfigData.pages && toolConfigData.pages[filePath]) delete toolConfigData.pages[filePath];
            await saveConfigToServerSilent();
            renderFilesAndPages();
        } catch(e) {}
    }
};

window.createNewPage = async () => {
    const title = document.getElementById('newPageTitle').value.trim();
    const slug = document.getElementById('newPageSlug').value.trim().toLowerCase().replace(/\s+/g, '-');
    const location = document.getElementById('newPageLocation').value;

    if(!title || !slug) return showToast('يرجى تعبئة جميع الحقول', 'error');

    const isNextJs = foundCorePaths.some(p => p.startsWith('app/'));
    const newFilePath = isNextJs ? `app/${slug}/page.jsx` : `${slug}.html`;

    const btn = document.querySelector('#newPageModal .btn-primary');
    btn.innerHTML = 'جاري الإنشاء...'; btn.disabled = true;

    try {
        if (isNextJs) await fetch('/api/create-folder', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({currentPath: currentToolFolder + '/app', folderName: slug}) });
        
        const defaultContent = isNextJs 
            ? `export default function ${slug.charAt(0).toUpperCase() + slug.slice(1)}Page() {\n  return (\n    <div className="container mx-auto p-4">\n      <h1 className="text-2xl font-bold">${title}</h1>\n      <p>محتوى الصفحة...</p>\n    </div>\n  );\n}` 
            : `<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head>\n<title>${title}</title>\n</head>\n<body>\n  <h1>${title}</h1>\n</body>\n</html>`;

        await fetch('/api/save-file', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filePath: currentToolFolder + '/' + newFilePath, content: defaultContent }) });

        if(!toolConfigData.pages) toolConfigData.pages = {};
        if(!toolConfigData.pages[newFilePath]) toolConfigData.pages[newFilePath] = {};
        toolConfigData.pages[newFilePath].location = location;
        toolConfigData.pages[newFilePath].title = title;
        await saveConfigToServerSilent();

        document.getElementById('newPageModal').style.display = 'none';
        renderFilesAndPages();
    } catch (e) {} finally {
        btn.innerHTML = 'إنشاء الملف'; btn.disabled = false;
    }
};


/**
 * ======================================================================
 * 🔗 7. الروابط الخارجية والسوشيال ميديا (LINKS & SOCIAL MEDIA)
 * ======================================================================
 */
window.createNewExternalLink = async () => {
    const title = document.getElementById('newLinkTitle').value.trim();
    const url = document.getElementById('newLinkUrl').value.trim();
    const location = document.getElementById('newLinkLocation').value;

    if(!title || !url) return showToast('الرجاء إدخال الاسم والرابط', 'error');

    if(!toolConfigData.externalLinks) toolConfigData.externalLinks = [];
    toolConfigData.externalLinks.push({ title, url, location });
    
    await saveConfigToServerSilent();
    showToast('تم إضافة الرابط بنجاح', 'success');
    document.getElementById('newLinkModal').style.display = 'none';
    document.getElementById('newLinkTitle').value = '';
    document.getElementById('newLinkUrl').value = '';
    renderFilesAndPages();
};

window.updateExternalLinkTitle = (index, newTitle) => { toolConfigData.externalLinks[index].title = newTitle; saveConfigToServerSilent(); };
window.updateExternalLinkLocation = (index, newLoc) => { toolConfigData.externalLinks[index].location = newLoc; saveConfigToServerSilent(); };
window.deleteExternalLink = async (index) => {
    if(confirm('هل أنت متأكد من حذف الرابط؟')) {
        toolConfigData.externalLinks.splice(index, 1);
        await saveConfigToServerSilent();
        renderFilesAndPages();
    }
};

window.openSocialModal = () => {
    document.getElementById('socialUrlInput').value = '';
    document.getElementById('socialIconClass').value = 'fa-solid fa-link';
    document.getElementById('socialIconPreview').innerHTML = '<i class="fa-solid fa-link"></i>';
    document.getElementById('socialModal').style.display = 'flex';
};

window.autoDetectSocialIcon = () => {
    const url = document.getElementById('socialUrlInput').value.toLowerCase();
    let iconClass = 'fa-solid fa-link'; 
    
    if (url.includes('twitter.com') || url.includes('x.com')) iconClass = 'fa-brands fa-x-twitter';
    else if (url.includes('facebook.com')) iconClass = 'fa-brands fa-facebook';
    else if (url.includes('instagram.com')) iconClass = 'fa-brands fa-instagram';
    else if (url.includes('tiktok.com')) iconClass = 'fa-brands fa-tiktok';
    else if (url.includes('youtube.com')) iconClass = 'fa-brands fa-youtube';
    else if (url.includes('snapchat.com')) iconClass = 'fa-brands fa-snapchat';
    else if (url.includes('linkedin.com')) iconClass = 'fa-brands fa-linkedin';
    else if (url.includes('whatsapp.com') || url.includes('wa.me')) iconClass = 'fa-brands fa-whatsapp';
    else if (url.includes('t.me') || url.includes('telegram.org')) iconClass = 'fa-brands fa-telegram';
    else if (url.includes('pinterest.com')) iconClass = 'fa-brands fa-pinterest';
    else if (url.includes('github.com')) iconClass = 'fa-brands fa-github';

    document.getElementById('socialIconClass').value = iconClass;
    document.getElementById('socialIconPreview').innerHTML = `<i class="${iconClass}"></i>`;
};

document.getElementById('socialIconClass')?.addEventListener('input', function() {
    document.getElementById('socialIconPreview').innerHTML = `<i class="${this.value}"></i>`;
});

window.saveSocialMedia = async () => {
    const url = document.getElementById('socialUrlInput').value.trim();
    const icon = document.getElementById('socialIconClass').value.trim();
    if (!url) return showToast('يرجى وضع رابط الحساب', 'error');

    if (!toolConfigData.socialMedia) toolConfigData.socialMedia = [];
    toolConfigData.socialMedia.push({ url, icon });

    await saveConfigToServerSilent();
    showToast('تم إضافة الحساب بنجاح', 'success');
    document.getElementById('socialModal').style.display = 'none';
    renderSocialMedia();
};

window.deleteSocialMedia = async (index) => {
    if(confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
        toolConfigData.socialMedia.splice(index, 1);
        await saveConfigToServerSilent();
        renderSocialMedia();
    }
};

window.renderSocialMedia = () => {
    const container = document.getElementById('socialMediaContainer');
    if (!toolConfigData.socialMedia || toolConfigData.socialMedia.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#94a3b8; padding: 10px;">لا توجد حسابات مضافة.</div>';
        return;
    }
    let html = '';
    toolConfigData.socialMedia.forEach((social, index) => {
        html += `
            <div class="social-card">
                <div class="social-info">
                    <div class="social-icon-circle"><i class="${social.icon}"></i></div>
                    <div style="font-size: 13px; direction: ltr; color: var(--text-sub); word-break: break-all;">${social.url}</div>
                </div>
                <button class="btn-secondary" onclick="deleteSocialMedia(${index})" style="color: #ef4444; border: none; background: #fee2e2; padding: 6px 12px; border-radius: 6px;"><i class="fa-solid fa-trash"></i> حذف</button>
            </div>
        `;
    });
    container.innerHTML = html;
};


/**
 * ======================================================================
 * 📝 8. المحرر الموحد (UNIFIED EDITOR)
 * ======================================================================
 */
window.openEditor = async (type, targetId) => {
    editorCurrentType = type;
    editorCurrentTarget = targetId;
    const editorArea = document.getElementById('unifiedEditorArea');
    const badge = document.getElementById('editorBadge');
    
    document.getElementById('editorModal').style.display = 'flex';
    editorArea.value = 'جاري التحميل...';
    editorArea.disabled = true;

    if (type === 'system') { 
        document.getElementById('modalEditorTitle').innerText = targetId;
        badge.innerText = 'تعديل ملف حقيقي';
        editorArea.style.direction = 'ltr';
        try {
            const res = await fetch(`/tools/${currentToolFolder}/${targetId}?t=${Date.now()}`);
            if(res.ok) editorArea.value = await res.text();
        } catch(e) {}
    } else if (type === 'virtual') { 
        const pageData = toolConfigData.customPages[targetId];
        document.getElementById('modalEditorTitle').innerText = pageData.title;
        badge.innerText = 'تعديل صفحة افتراضية';
        editorArea.style.direction = 'rtl'; 
        editorArea.value = pageData.content || '';
    }
    editorArea.disabled = false;
};

window.saveEditorContent = async () => {
    const content = document.getElementById('unifiedEditorArea').value;
    try {
        if (editorCurrentType === 'system') {
            await fetch('/api/save-file', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filePath: currentToolFolder + '/' + editorCurrentTarget, content: content }) });
        } else {
            toolConfigData.customPages[editorCurrentTarget].content = content;
            await saveConfigToServerSilent();
        }
        document.getElementById('editorModal').style.display = 'none';
        showToast('تم حفظ الملف', 'success');
    } catch (e) {} 
};


/**
 * ======================================================================
 * 🛠️ 9. أدوات بناء الموقع والمرافق (BUILD & UTILITIES)
 * ======================================================================
 */
window.openCreateFolderModal = () => { document.getElementById('folderSystemName').value = ''; document.getElementById('folderModal').style.display = 'flex'; };
window.createFolder = async () => {
    const folderName = document.getElementById('folderSystemName').value.trim();
    if(!folderName) return;
    try {
        await fetch('/api/create-folder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPath: '', folderName: folderName }) });
        document.getElementById('folderModal').style.display = 'none'; loadFolders();
    } catch (error) {}
};

window.openVSCode = () => { window.open(`http://${window.location.hostname}:8080`, '_blank'); };

window.buildTool = async () => {
    const btn = document.getElementById('buildToolBtn');
    const origText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري البناء...'; btn.disabled = true;
    try {
        const res = await fetch('/api/build-tool', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toolName: currentToolFolder }) });
        const data = await res.json();
        if (data.success) {
            btn.innerHTML = '<i class="fa-solid fa-check"></i> تم التحديث';
            btn.style.backgroundColor = '#10b981'; btn.style.color = '#fff';
        } else {
            btn.innerHTML = origText;
        }
    } catch (e) { btn.innerHTML = origText; } 
    finally {
        setTimeout(() => { btn.innerHTML = origText; btn.disabled = false; btn.style.backgroundColor = '#eab308'; btn.style.color = '#1e293b'; }, 3000);
    }
};