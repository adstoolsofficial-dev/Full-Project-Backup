'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
    const [config, setConfig] = useState(null);
    const [msg, setMsg] = useState('');

    // جلب الإعدادات الحالية
    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => setConfig(data));
    }, []);

    const handleSave = async () => {
        setMsg('جاري الحفظ...');
        const res = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        if (res.ok) setMsg('✅ تم حفظ الإعدادات وتحديث الموقع بنجاح!');
        else setMsg('❌ حدث خطأ أثناء الحفظ.');
        setTimeout(() => setMsg(''), 4000);
    };

    const addLink = () => {
        const newLinks = [...(config.externalLinks || []), { title: '', url: '', location: 'header' }];
        setConfig({ ...config, externalLinks: newLinks });
    };

    const updateLink = (index, key, value) => {
        const newLinks = [...config.externalLinks];
        newLinks[index][key] = value;
        setConfig({ ...config, externalLinks: newLinks });
    };

    const removeLink = (index) => {
        const newLinks = config.externalLinks.filter((_, i) => i !== index);
        setConfig({ ...config, externalLinks: newLinks });
    };

    if (!config) return <div style={{ padding: '50px', textAlign: 'center' }}>جاري تحميل لوحة التحكم...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '50px auto', padding: '30px', direction: 'rtl', fontFamily: 'inherit', background: 'var(--bg-card)', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ color: 'var(--primary)' }}>⚙️ إدارة الأداة</h2>
            {msg && <div style={{ padding: '15px', background: '#10b98120', color: '#10b981', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>{msg}</div>}
            
            <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold' }}>اسم الأداة:</label>
                <input 
                    type="text" 
                    value={config.toolDisplayName || ''} 
                    onChange={e => setConfig({...config, toolDisplayName: e.target.value})}
                    style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }}
                />
            </div>

            <div style={{ marginBottom: '30px' }}>
                <label style={{ fontWeight: 'bold' }}>وصف الأداة (Slogan):</label>
                <input 
                    type="text" 
                    value={config.toolSlogan || ''} 
                    onChange={e => setConfig({...config, toolSlogan: e.target.value})}
                    style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }}
                />
            </div>

            <hr style={{ borderColor: 'var(--border-color)', margin: '30px 0' }} />

            <h3 style={{ marginBottom: '15px' }}>🔗 إدارة الصفحات والروابط</h3>
            {config.externalLinks?.map((link, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                    <input 
                        type="text" 
                        placeholder="اسم الصفحة (مثال: من نحن)" 
                        value={link.title} 
                        onChange={e => updateLink(idx, 'title', e.target.value)}
                        style={{ padding: '10px', flex: '1 1 200px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }}
                    />
                    <input 
                        type="text" 
                        placeholder="الرابط (URL)" 
                        value={link.url} 
                        onChange={e => updateLink(idx, 'url', e.target.value)}
                        style={{ padding: '10px', flex: '2 1 300px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }}
                    />
                    <select 
                        value={link.location} 
                        onChange={e => updateLink(idx, 'location', e.target.value)}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }}
                    >
                        <option value="header">الهيدر فقط</option>
                        <option value="footer">الفوتر فقط</option>
                        <option value="both">الهيدر والفوتر</option>
                    </select>
                    <button onClick={() => removeLink(idx)} style={{ padding: '10px 15px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>حذف</button>
                </div>
            ))}
            
            <button onClick={addLink} style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', marginTop: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                + إضافة صفحة جديدة
            </button>

            <div style={{ marginTop: '40px', textAlign: 'left' }}>
                <button onClick={handleSave} style={{ padding: '12px 35px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
                    💾 حفظ التعديلات
                </button>
            </div>
        </div>
    );
}