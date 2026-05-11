'use client';
import React from 'react';
import configData from '../config.json'; // السطر السحري: استيراد البيانات مباشرة!

interface HeaderProps {
  lang: string;
  isDarkMode: boolean;
  toggleLang: () => void;
  toggleTheme: () => void;
}

interface PageLink {
    title: string;
    url: string;
    isExternal?: boolean; // تمت الإضافة لمعرفة الروابط الخارجية
}

export default function Header({ lang, isDarkMode, toggleLang, toggleTheme }: HeaderProps) {
    const toolName = configData.toolDisplayName || '';
    const toolSlogan = configData.toolSlogan || '';
    const hasLogo = configData.hasLogo || false;
    
    // استخراج الروابط برمجياً وفورياً بدون انتظار
    const navLinks: PageLink[] = [];
    
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
                navLinks.push({ title: pageData.title || key, url, isExternal: false });
            }
        });
    };

    processLinks(configData.pages, 'header');
    processLinks(configData.customPages, 'header');

    // 2. جلب الروابط الخارجية
    if (configData.externalLinks && Array.isArray(configData.externalLinks)) {
        configData.externalLinks.forEach((link: any) => {
            if (link.location === 'header' || link.location === 'both') {
                navLinks.push({ title: link.title, url: link.url, isExternal: true });
            }
        });
    }

    return (
        <div className="header" style={{ minHeight: '150px', position: 'relative' }}>
            <div className="top-controls">
                <button onClick={toggleTheme} className="control-btn" title={lang === 'ar' ? 'تبديل المظهر' : 'Toggle Theme'}>
                    <i className={isDarkMode ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
                </button>
                <button onClick={toggleLang} className="control-btn" title={lang === 'ar' ? 'English' : 'عربي'}>
                    {lang === 'ar' ? 'EN' : 'عربي'}
                </button>
            </div>
            
            {/* عرض الشعار بدون تحديد الامتداد */}
            {hasLogo && <img src={`/logo?t=${Date.now()}`} alt="Tool Logo" className="logo" style={{ marginTop: '10px' }} />} 

            <div className="tool-branding">
                {toolName && <h1 className="tool-title">{toolName}</h1>}
                {toolSlogan && <p className="tool-slogan">{toolSlogan}</p>}
            </div>

            {/* عرض القائمة العلوية (Header Nav) */}
            {navLinks.length > 0 && (
                <nav style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '15px', flexWrap: 'wrap' }}>
                    {navLinks.map((link, idx) => (
                        <a 
                            key={idx} 
                            href={link.url} 
                            style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px', padding: '5px 10px', borderRadius: '5px', transition: '0.3s' }} 
                            className="hover-nav"
                            target={link.isExternal ? '_blank' : '_self'}
                            rel={link.isExternal ? 'noopener noreferrer' : undefined}
                        >
                            {link.title}
                        </a>
                    ))}
                </nav>
            )}
        </div>
    );
}