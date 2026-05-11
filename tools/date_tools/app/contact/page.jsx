'use client';
import { useEffect, useState } from 'react';
import configData from '../../config.json'; // استيراد ملف الإعدادات لقراءة الإيميل

export default function ContactUs() {
    const [lang, setLang] = useState('ar');

    // سحب الإيميل من لوحة التحكم، مع وضع إيميل افتراضي في حال كان الحقل فارغاً
    const contactEmail = configData.contactEmail || " ";

    useEffect(() => {
        const savedLang = localStorage.getItem('site_lang') || 'ar';
        setLang(savedLang);
        document.documentElement.lang = savedLang;
        document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
        
        const savedTheme = localStorage.getItem('site_theme');
        const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) document.body.classList.add('dark-mode');
        else document.body.classList.remove('dark-mode');
    }, []);
    
    return (
        <div className="container">
            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href="/" className="control-btn" style={{ textDecoration: 'none', width: 'auto', padding: '0 15px' }}>
                    <i className="fa-solid fa-arrow-right"></i> {lang === 'ar' ? 'العودة' : 'Back'}
                </a>
                <h1>{lang === 'ar' ? 'اتصل بنا' : 'Contact Us'}</h1>
                <div style={{ width: '80px' }}></div>
            </div>

            <div className="card" style={{ lineHeight: '1.8', textAlign: 'center', padding: '40px 20px' }}>
                <i className="fa-solid fa-envelope-open-text" style={{ fontSize: '48px', color: 'var(--primary)', marginBottom: '20px' }}></i>
                
                {lang === 'ar' ? (
                    <>
                        <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>نسعد بتواصلكم معنا!</h3>
                        <p style={{ color: 'var(--text-sub)', fontSize: '16px', maxWidth: '600px', margin: '0 auto 30px' }}>
                            إذا كان لديكم أي استفسار، اقتراح لتطوير الأداة، أو واجهتم أي مشكلة تقنية، لا تترددوا في مراسلتنا. نحن نهتم بآرائكم ونعمل دائماً على تقديم أفضل تجربة لكم.
                        </p>
                        
                        <div style={{ background: 'var(--input-bg)', padding: '20px', borderRadius: '12px', display: 'inline-block', border: '1px solid var(--border-color)' }}>
                            <p style={{ margin: '0 0 10px', fontWeight: 'bold' }}>البريد الإلكتروني المباشر:</p>
                            {/* هنا استخدمنا المتغير الديناميكي للإيميل */}
                            <a href={`mailto:${contactEmail}`} style={{ fontSize: '20px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold', direction: 'ltr', display: 'inline-block' }}>
                                {contactEmail}
                            </a>
                        </div>
                        <p style={{ marginTop: '20px', fontSize: '14px', color: 'var(--text-sub)' }}>سنقوم بالرد عليكم في أقرب وقت ممكن (عادة خلال 24-48 ساعة).</p>
                    </>
                ) : (
                    <>
                        <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>We'd love to hear from you!</h3>
                        <p style={{ color: 'var(--text-sub)', fontSize: '16px', maxWidth: '600px', margin: '0 auto 30px' }}>
                            If you have any questions, suggestions for tool improvement, or encounter any technical issues, please don't hesitate to reach out. We value your feedback and always strive to provide the best experience.
                        </p>
                        
                        <div style={{ background: 'var(--input-bg)', padding: '20px', borderRadius: '12px', display: 'inline-block', border: '1px solid var(--border-color)' }}>
                            <p style={{ margin: '0 0 10px', fontWeight: 'bold' }}>Direct Email:</p>
                            {/* هنا أيضاً استخدمنا المتغير الديناميكي للإيميل */}
                            <a href={`mailto:${contactEmail}`} style={{ fontSize: '20px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>
                                {contactEmail}
                            </a>
                        </div>
                        <p style={{ marginTop: '20px', fontSize: '14px', color: 'var(--text-sub)' }}>We will respond to you as soon as possible (usually within 24-48 hours).</p>
                    </>
                )}
            </div>
        </div>
    );
}