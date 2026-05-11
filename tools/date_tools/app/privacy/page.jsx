'use client';
import { useEffect, useState } from 'react';

export default function PrivacyPolicy() {
    const [lang, setLang] = useState('ar');

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
                <h1>{lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</h1>
                <div style={{ width: '80px' }}></div> {/* توازن بصري */}
            </div>

            <div className="card" style={{ lineHeight: '1.8', textAlign: lang === 'ar' ? 'right' : 'left' }}>
                {lang === 'ar' ? (
                    <>
                        <h3>مقدمة</h3>
                        <p>نحن في "أدوات التاريخ الشاملة" نولي أهمية كبرى لخصوصية زوارنا. توضح هذه الوثيقة أنواع المعلومات الشخصية التي نتلقاها ونجمعها وكيفية استخدامها.</p>

                        <h3>ملفات السجل (Log Files)</h3>
                        <p>مثل الكثير من مواقع الويب الأخرى، نستخدم ملفات السجل. المعلومات الموجودة داخل هذه الملفات تشمل عناوين بروتوكول الإنترنت (IP)، نوع المتصفح، مزود خدمة الإنترنت، طابع التاريخ/الوقت، وصفحات الإحالة/الخروج. هذه المعلومات لا ترتبط بأي معلومات تحدد هويتك الشخصية، وتستخدم فقط لتحليل الاتجاهات وإدارة الموقع.</p>

                        <h3>ملفات تعريف الارتباط (Cookies) وإعلانات Google AdSense</h3>
                        <p>
                            نحن نستخدم إعلانات Google كمورد مالي. 
                            <br/>- تستخدم Google ملفات تعريف الارتباط (بما في ذلك ملف تعريف ارتباط DART) لعرض الإعلانات للمستخدمين بناءً على زياراتهم السابقة لموقعنا ولمواقع أخرى على الإنترنت.
                            <br/>- يمكن للمستخدمين إلغاء الاشتراك في استخدام ملف تعريف ارتباط DART بزيارة <a href="https://policies.google.com/technologies/ads" target="_blank" rel="nofollow" style={{color: 'var(--primary)'}}>سياسة الخصوصية الخاصة بإعلانات Google وشبكة المحتوى</a>.
                        </p>

                        <h3>موافقتك</h3>
                        <p>باستخدامك لموقعنا، فإنك توافق على سياسة الخصوصية الخاصة بنا وتوافق على شروطها.</p>
                    </>
                ) : (
                    <>
                        <h3>Introduction</h3>
                        <p>At Comprehensive Date Tools, the privacy of our visitors is of extreme importance to us. This privacy policy document outlines the types of personal information is received and collected by us and how it is used.</p>

                        <h3>Log Files</h3>
                        <p>Like many other Web sites, we makes use of log files. The information inside the log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date/time stamp, and referring/exit pages. This information is not linked to any information that is personally identifiable.</p>

                        <h3>Cookies and Google AdSense</h3>
                        <p>
                            We use Google AdSense advertising on our website.
                            <br/>- Google uses cookies (including the DART cookie) to serve ads based on a user's prior visits to our website or other websites.
                            <br/>- Users may opt-out of the use of the DART cookie by visiting the <a href="https://policies.google.com/technologies/ads" target="_blank" rel="nofollow" style={{color: 'var(--primary)'}}>Google ad and content network privacy policy</a>.
                        </p>

                        <h3>Consent</h3>
                        <p>By using our website, you hereby consent to our privacy policy and agree to its terms.</p>
                    </>
                )}
            </div>
        </div>
    );
}