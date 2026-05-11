'use client';
import React from 'react';
import configData from '../config.json'; // استيراد مباشر

interface FooterProps {
  lang: string;
  i18n: Record<string, any>;
}

interface PageLink {
    title: string;
    url: string;
    isExternal?: boolean; // لمعرفة ما إذا كان الرابط خارجياً
}

export default function Footer({ lang, i18n }: FooterProps) {
    const currentYear = new Date().getFullYear();
    const customCopyright = configData.copyright || '';

    // معالجة روابط الفوتر فورياً
    const footerLinks: PageLink[] = [];
    
    // 1. جلب الصفحات الداخلية (النظامية والافتراضية)
    const processLinks = (pagesObj: any, targetLocation: string) => {
        if (!pagesObj) return;
        Object.entries(pagesObj).forEach(([key, pageData]: [string, any]) => {
            if (pageData.location === targetLocation || pageData.location === 'both') {
                let url = `/${key}`;
                if (key.startsWith('app/')) {
                    const parts = key.split('/');
                    if (parts.length >= 3 && parts[parts.length - 1].startsWith('page.')) {
                        url = `/${parts[parts.length - 2]}`;
                    } else {
                        url = `/`;
                    }
                } else if (key.endsWith('.html')) {
                    url = `/${key.replace('.html', '')}`;
                }
                footerLinks.push({ title: pageData.title || key, url, isExternal: false });
            }
        });
    };

    processLinks(configData.pages, 'footer');
    processLinks(configData.customPages, 'footer');

    // 2. جلب الروابط الخارجية
    if (configData.externalLinks && Array.isArray(configData.externalLinks)) {
        configData.externalLinks.forEach((link: any) => {
            if (link.location === 'footer' || link.location === 'both') {
                footerLinks.push({ title: link.title, url: link.url, isExternal: true });
            }
        });
    }

    // 3. جلب حسابات السوشيال ميديا
    const socialMedia = configData.socialMedia || [];

    return (
        <footer style={{ padding: '30px 15px', textAlign: 'center', backgroundColor: 'var(--bg-color)', borderTop: '1px solid var(--border-color)' }}>
            
            {/* --- عرض الروابط الديناميكية (الداخلية والخارجية) --- */}
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {footerLinks.map((link, idx) => (
                    <a 
                        key={idx} 
                        href={link.url} 
                        style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}
                        target={link.isExternal ? '_blank' : '_self'}
                        rel={link.isExternal ? 'noopener noreferrer' : ''}
                    >
                        {link.title}
                    </a>
                ))}

                {/* عرض الروابط الافتراضية إذا كان الكونفق فارغاً تماماً */}
                {footerLinks.length === 0 && (
                    <>
                        <a href="/privacy" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '600' }}>
                            {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                        </a>
                        <a href="/terms" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '600' }}>
                            {lang === 'ar' ? 'شروط الاستخدام' : 'Terms of Use'}
                        </a>
                        <a href="/contact" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '600' }}>
                            {lang === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                        </a>
                    </>
                )}
            </div>

            {/* --- 🔥 عرض أيقونات السوشيال ميديا --- */}
            {socialMedia.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                    {socialMedia.map((social: any, idx: number) => (
                        <a 
                            key={idx} 
                            href={social.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                                color: 'var(--text-sub)', 
                                fontSize: '22px',
                                transition: 'color 0.2s ease-in-out',
                                textDecoration: 'none'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-sub)'}
                        >
                            <i className={social.icon}></i>
                        </a>
                    ))}
                </div>
            )}

            {/* --- حقوق النشر --- */}
            <div style={{ direction: lang === 'ar' ? 'rtl' : 'ltr', color: 'var(--text-sub)', fontSize: '14px' }}>
                <span>{i18n[lang].rights}</span> &copy; {currentYear} - <span>{customCopyright ? customCopyright : i18n[lang].footerPortal}</span>
            </div>
        </footer>
    );
}