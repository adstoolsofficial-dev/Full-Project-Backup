'use client';
import React, { useState, useEffect } from 'react';
import initialConfigData from '../config.json'; 

export default function Header({ lang, isDarkMode, toggleLang, toggleTheme }) {
    const [configData, setConfigData] = useState(initialConfigData);

    // سحب الإعدادات فورياً
    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) setConfigData(data);
            })
            .catch(err => console.error("Error fetching config:", err));
    }, []);

    const toolName = configData.toolDisplayName || 'أداة التواريخ';
    const toolSlogan = configData.toolSlogan || '';
    const hasLogo = configData.hasLogo || false;
    
    const navLinks = [];
    
    const processLinks = (pagesObj, targetLocation) => {
        if (!pagesObj) return;
        Object.entries(pagesObj).forEach(([key, pageData]) => {
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

    if (configData.externalLinks && Array.isArray(configData.externalLinks)) {
        configData.externalLinks.forEach((link) => {
            if (link.location === 'header' || link.location === 'both') {
                navLinks.push({ title: link.title, url: link.url, isExternal: true });
            }
        });
    }

    return (
        <div className="header" style={{ minHeight: '150px', position: 'relative' }}>
            <div className="top-controls">
                <button onClick={toggleTheme} className="control-btn" title={isDarkMode ? 'الوضع المضيء' : 'الوضع الليلي'}>
                    <i className={isDarkMode ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
                </button>
                <button onClick={toggleLang} className="control-btn lang-btn">{lang === 'ar' ? 'English' : 'عربي'}</button>
            </div>
            {hasLogo ? (
                <div className="logo-container" style={{ textAlign: 'center', marginBottom: '15px' }}>
                    <img src="/logo.png" alt={toolName} style={{ maxHeight: '80px' }} />
                </div>
            ) : (
                <h1 className="tool-title" style={{ color: 'var(--primary)', textAlign: 'center' }}>{toolName}</h1>
            )}
            {toolSlogan && <p className="tool-slogan" style={{ textAlign: 'center', color: 'var(--text-sub)' }}>{toolSlogan}</p>}
            
            <nav className="nav-links" style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginTop: '20px' }}>
                <a href="/" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 'bold' }}>{lang === 'ar' ? 'الرئيسية' : 'Home'}</a>
                {navLinks.map((link, idx) => (
                    <a key={idx} href={link.url} target={link.isExternal ? '_blank' : '_self'} rel={link.isExternal ? 'noopener noreferrer' : ''} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                        {link.title} {link.isExternal && <i className="fa-solid fa-arrow-up-right-from-square" style={{fontSize: '10px', marginInlineStart: '4px'}}></i>}
                    </a>
                ))}
            </nav>
        </div>
    );
}