'use client';
import React, { useState, useEffect } from 'react';
import initialConfigData from '../config.json'; 

export default function Footer({ lang }) {
    const [configData, setConfigData] = useState(initialConfigData);

    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) setConfigData(data);
            })
            .catch(err => console.error("Error fetching config:", err));
    }, []);

    const footerLinks = [];

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
                footerLinks.push({ title: pageData.title || key, url, isExternal: false });
            }
        });
    };

    processLinks(configData.pages, 'footer');
    processLinks(configData.customPages, 'footer');

    if (configData.externalLinks && Array.isArray(configData.externalLinks)) {
        configData.externalLinks.forEach((link) => {
            if (link.location === 'footer' || link.location === 'both') {
                footerLinks.push({ title: link.title, url: link.url, isExternal: true });
            }
        });
    }

    return (
        <footer className="footer" style={{ padding: '20px', textAlign: 'center', marginTop: '40px', borderTop: '1px solid var(--border-color)' }}>
            <nav style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
                {footerLinks.map((link, idx) => (
                    <a key={idx} href={link.url} target={link.isExternal ? '_blank' : '_self'} rel={link.isExternal ? 'noopener noreferrer' : ''} style={{ color: 'var(--text-sub)', textDecoration: 'none' }}>
                        {link.title} {link.isExternal && <i className="fa-solid fa-arrow-up-right-from-square" style={{fontSize: '10px', marginInlineStart: '4px'}}></i>}
                    </a>
                ))}
            </nav>
            <p style={{ color: 'var(--text-sub)', fontSize: '14px' }}>
                © {new Date().getFullYear()} {configData.toolDisplayName || 'جميع الحقوق محفوظة'}
            </p>
        </footer>
    );
}