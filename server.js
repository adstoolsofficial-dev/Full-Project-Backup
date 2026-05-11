require('dotenv').config(); // تحميل ملف الأسرار المخفي
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const svgCaptcha = require('svg-captcha');
const { exec } = require('child_process');
const os = require('os');
const app = express();

// مسار جدول التوجيه المركزي
const domainsFilePath = path.join(__dirname, 'domains.json');

// ==========================================
// 🛡️ دوال الحماية الأساسية (Security Core)
// ==========================================

const getSafePath = (userPath) => {
    const baseToolsDir = path.join(__dirname, 'tools');
    const targetPath = path.resolve(baseToolsDir, userPath || '');
    if (!targetPath.startsWith(baseToolsDir)) {
        throw new Error('محاولة اختراق مسار! تم الحظر.');
    }
    return targetPath;
};

const sanitizeText = (text) => {
    if (typeof text !== 'string') return text;
    return text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
};

const requireBackendAuth = (req, res, next) => {
    if (req.url.startsWith('/api/auth-backend') || req.url.startsWith('/api/captcha') || req.url.startsWith('/api/verify-captcha')) {
        return next();
    }
    const criticalRoutes = ['/api/server-action'];
    if (criticalRoutes.includes(req.path) && !req.session.isBackendAdmin) {
        return res.status(403).json({ success: false, message: 'مرفوض: غير مصرح لك بتنفيذ عمليات إدارية خطيرة.' });
    }
    next();
};

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.set('trust proxy', 1);

app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret', 
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: true,   
        httpOnly: true, 
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 
    } 
}));

app.use(requireBackendAuth);

app.post('/api/auth-backend', (req, res) => {
    const { serverKey } = req.body;
    if (serverKey === process.env.ADMIN_API_KEY) {
        req.session.isBackendAdmin = true;
        res.json({ success: true, message: 'تم فتح السيرفر بنجاح.' });
    } else {
        res.status(401).json({ success: false, message: 'مفتاح السيرفر غير صحيح.' });
    }
});

// ==========================================
// 🚀 نظام التوجيه المركزي فائق السرعة (Centralized Routing)
// ==========================================

app.use((req, res, next) => {
    const rawHost = req.headers.host ? req.headers.host.split(':')[0] : '';
    const host = rawHost.replace(/^www\./, '').trim();
    
    if (req.url.startsWith('/api')) return next();

    if (host === 'ads-tools-official.com') {
        const officialWebsitePath = path.join(__dirname, 'ads-tools-official');
        return express.static(officialWebsitePath)(req, res, next);
    }

    try {
        if (fs.existsSync(domainsFilePath)) {
            const domainsMap = JSON.parse(fs.readFileSync(domainsFilePath, 'utf8'));
            const folderName = domainsMap[host]; 

            if (folderName) {
                const folderPath = getSafePath(folderName);
                
                // 🪄 الساحر: لاقط الميديا الديناميكي (بدون امتداد)
                const urlPath = req.url.split('?')[0]; // إزالة ?t=123
                if (urlPath === '/logo' || urlPath === '/favicon.ico') {
                    const baseName = urlPath === '/favicon.ico' ? 'favicon' : 'logo';
                    // يبحث في جميع هذه الامتدادات بالترتيب
                    const exts = ['.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.ico'];
                    for (let ext of exts) {
                        const filePath = path.join(folderPath, baseName + ext);
                        if (fs.existsSync(filePath)) {
                            return res.sendFile(filePath);
                        }
                    }
                    return res.status(404).send('');
                }
                // ===============================================

                const outPath = path.join(folderPath, 'out');

                if (fs.existsSync(path.join(outPath, 'index.html'))) {
                    // تقديم مجلد out أولاً.. وإذا لم يجد الملف داخله، يبحث في المجلد الرئيسي (ميزة جبارة للملفات المرفوعة يدوياً!)
                    return express.static(outPath)(req, res, () => {
                        express.static(folderPath)(req, res, next);
                    });
                } else if (!fs.existsSync(path.join(folderPath, 'index.html'))) {
                    return res.status(404).send('<h2 style="text-align:center; font-family:tahoma; margin-top:50px;">الأداة قيد التجهيز. يرجى عمل Build لإنشاء مجلد out.</h2>');
                }

                return express.static(folderPath)(req, res, next);
            }
        }
    } catch(e) { 
        console.error("Routing Error:", e);
    }
    
    next();
});

// مسارات بديلة
app.use('/tools', express.static(path.join(__dirname, 'tools')));
app.get('/', (req, res) => res.send('<h2 style="text-align:center; font-family:tahoma; margin-top:50px;">دومين غير مسجل في جدول السيرفر</h2>'));

// ==========================================
// نظام الكابتشا (CAPTCHA System)
// ==========================================
app.get('/api/captcha', (req, res) => {
    const captcha = svgCaptcha.create({ size: 5, ignoreChars: '0o1ilI', noise: 3, color: true, background: '#f8fafc' });
    req.session.captcha = captcha.text;
    res.type('svg').status(200).send(captcha.data);
});
app.post('/api/verify-captcha', (req, res) => {
    const { code } = req.body;
    if (!req.session.captcha) return res.json({ success: false, message: 'انتهت الصلاحية.' });
    if (code.toLowerCase() === req.session.captcha.toLowerCase()) {
        req.session.captcha = null; res.json({ success: true });
    } else res.json({ success: false, message: 'الرمز غير صحيح.' });
});

// ==========================================
// API جلب وإدارة الملفات (المحمية)
// ==========================================
app.get('/api/tools', (req, res) => {
    try {
        const toolsPath = getSafePath('');
        if (!fs.existsSync(toolsPath)) return res.json({ success: true, data: [] });
        const folders = fs.readdirSync(toolsPath).filter(item => fs.statSync(path.join(toolsPath, item)).isDirectory());
        res.json({ success: true, data: folders });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.get('/api/files', (req, res) => {
    try {
        const fullPath = getSafePath(req.query.path);
        if (!fs.existsSync(fullPath)) return res.status(404).json({ success: false, message: 'غير موجود' });
        const items = fs.readdirSync(fullPath).map(item => {
            const stat = fs.statSync(path.join(fullPath, item));
            return { name: item, isDirectory: stat.isDirectory(), path: path.join(req.query.path || '', item).replace(/\\/g, '/'), ext: path.extname(item) };
        });
        res.json({ success: true, data: items });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.post('/api/add-file', (req, res) => {
    try {
        const targetDir = getSafePath(req.body.currentPath);
        const fileName = req.body.fileName;
        const targetFile = getSafePath(path.join(req.body.currentPath || '', fileName));
        
        if (req.body.isUpload) {
            const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'];
            const ext = path.extname(fileName).toLowerCase();
            if (!allowedExtensions.includes(ext)) {
                return res.status(403).json({ success: false, message: 'مرفوض: غير مسموح.' });
            }
        }

        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
        
        if (req.body.isUpload && req.body.contentBase64) {
            const base64Data = req.body.contentBase64.split(';base64,').pop();
            fs.writeFileSync(targetFile, base64Data, { encoding: 'base64' });
        } else {
            fs.writeFileSync(targetFile, '', 'utf8');
        }
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ---------------------------------------------------------
// 🔥 الدالة السحرية: حفظ الملف + تحديث الدومينات تلقائياً
// ---------------------------------------------------------
app.post('/api/save-file', (req, res) => {
    try {
        const targetFile = getSafePath(req.body.filePath);
        let contentToSave = req.body.content;

        if (targetFile.endsWith('config.json')) {
            try {
                let parsedConfig = JSON.parse(contentToSave);
                for (let key in parsedConfig) {
                    if (typeof parsedConfig[key] === 'string' && key !== 'googleAds') {
                        parsedConfig[key] = sanitizeText(parsedConfig[key]);
                    }
                }
                contentToSave = JSON.stringify(parsedConfig, null, 4);

                // --- تحديث ملف domains.json تلقائياً ---
                if (parsedConfig.toolDomain) {
                    let cleanDomain = parsedConfig.toolDomain.replace(/^https?:\/\//, '').split('/')[0].trim().replace(/^www\./, '');
                    if (cleanDomain) {
                        // استخراج اسم المجلد (مثلاً: date_tools) من مسار الملف
                        const pathParts = targetFile.split(path.sep);
                        const folderName = pathParts[pathParts.length - 2]; 

                        let domainsMap = {};
                        if (fs.existsSync(domainsFilePath)) {
                            domainsMap = JSON.parse(fs.readFileSync(domainsFilePath, 'utf8'));
                        }
                        domainsMap[cleanDomain] = folderName;
                        fs.writeFileSync(domainsFilePath, JSON.stringify(domainsMap, null, 4), 'utf8');
                        console.log(`✅ تم ربط الدومين ${cleanDomain} بالمجلد ${folderName} بنجاح.`);
                    }
                }
                // ---------------------------------------

            } catch (e) { console.log("تخطي التنظيف: الملف ليس JSON صالحاً"); }
        }

        fs.writeFileSync(targetFile, contentToSave, 'utf8');
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.post('/api/create-folder', (req, res) => {
    try {
        const targetDir = getSafePath(path.join(req.body.currentPath || '', req.body.folderName));
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.post('/api/delete-item', (req, res) => {
    try {
        const target = getSafePath(req.body.itemPath);
        if (fs.existsSync(target)) {
            fs.rmSync(target, { recursive: true, force: true });
        }
        res.json({ success: true, message: 'تم الحذف بنجاح' });
    } catch (error) { 
        res.status(500).json({ success: false, message: error.message }); 
    }
});

// ==========================================
// API مركز القيادة وإدارة الخادم (المحمية)
// ==========================================
app.get('/api/server-stats', (req, res) => {
    try {
        const totalMem = os.totalmem(); 
        const usedMem = totalMem - os.freemem();
        res.json({
            success: true,
            memory: { used: (usedMem/1073741824).toFixed(2), total: (totalMem/1073741824).toFixed(2), percentage: ((usedMem/totalMem)*100).toFixed(1) },
            cpu: { percentage: ((os.loadavg()[0] / os.cpus().length) * 100).toFixed(1) },
            uptime: os.uptime()
        });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.post('/api/server-action', (req, res) => {
    if (!req.session.isBackendAdmin) return res.status(403).json({ success: false });

    const { action } = req.body;
    if (action === 'restart_server') {
        res.json({ success: true, message: 'جاري إعادة تشغيل السيرفر...' });
        setTimeout(() => exec('pm2 restart project-tools-official'), 1000);
    } else if (action === 'clear_cache') {
        res.json({ success: true, message: 'تم تفريغ الذاكرة المؤقتة.' });
    } else res.status(400).json({ success: false, message: 'أمر مجهول.' });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ الخادم محمي ويعمل على منفذ ${PORT}`));



// ==========================================
// 🏭 API بناء الأداة أوتوماتيكياً (Auto Build)
// ==========================================
app.post('/api/build-tool', (req, res) => {
    const { toolName } = req.body;
    if (!toolName) return res.status(400).json({ success: false, message: 'اسم الأداة مفقود' });

    try {
        const targetDir = getSafePath(toolName);
        
        exec('npm run build', { cwd: targetDir }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Build Error: ${error.message}`);
                // 🔥 التعديل هنا: إرسال الخطأ الفعلي بصراحة للواجهة
                return res.status(500).json({ success: false, message: `فشل البناء: ${error.message}` });
            }
            res.json({ success: true, message: 'تم بناء مجلد out وتحديث الأداة بنجاح!' });
        });
    } catch (e) {
        res.status(500).json({ success: false, message: `خطأ داخلي: ${e.message}` });
    }
});