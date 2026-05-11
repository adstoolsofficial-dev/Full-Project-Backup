'use client';
import { useEffect, useState } from 'react';

export default function TermsOfUse() {
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
                <h1>{lang === 'ar' ? 'شروط الاستخدام' : 'Terms of Use'}</h1>
                <div style={{ width: '80px' }}></div>
            </div>

            <div className="card" style={{ lineHeight: '1.8', textAlign: lang === 'ar' ? 'right' : 'left' }}>
                {lang === 'ar' ? (
                    <>
                        <h3>القبول بالشروط</h3>
                        <p>بدخولك واستخدامك لموقع "أدوات التاريخ الشاملة"، فإنك تقر وتوافق على الالتزام بشروط الاستخدام الموضحة في هذه الصفحة. إذا كنت لا توافق على أي من هذه الشروط، يُرجى عدم استخدام الموقع.</p>

                        <h3>إخلاء المسؤولية (Disclaimer)</h3>
                        <p>تم توفير الأدوات والحاسبات في هذا الموقع (مثل حاسبة العمر وتحويل التاريخ) لأغراض إعلامية وتسهيلية فقط. على الرغم من أننا نبذل قصارى جهدنا لضمان دقة النتائج، إلا أننا لا نقدم أي ضمانات صريحة أو ضمنية بشأن خلوها المطلق من الأخطاء. لا يتحمل الموقع أي مسؤولية قانونية أو مالية تنتج عن الاعتماد الكلي على هذه النتائج في المعاملات الرسمية.</p>

                        <h3>الاستخدام المقبول</h3>
                        <p>يُمنع استخدام الموقع بطريقة تسبب ضرراً للخوادم أو الشبكات المرتبطة به. كما يُمنع استخدام أي برامج روبوت (Bots) لاستخراج البيانات أو استهلاك موارد النظام بشكل تلقائي.</p>

                        <h3>التعديلات</h3>
                        <p>نحتفظ بالحق في تعديل شروط الاستخدام في أي وقت دون إشعار مسبق. استمرارك في استخدام الموقع بعد أي تغييرات يُعد قبولاً منك بالشروط الجديدة.</p>
                    </>
                ) : (
                    <>
                        <h3>Acceptance of Terms</h3>
                        <p>By accessing and using the Comprehensive Date Tools website, you accept and agree to be bound by the terms and provision of this agreement.</p>

                        <h3>Disclaimer</h3>
                        <p>The tools and calculators provided on this website (such as the age calculator and date converter) are for informational purposes only. While we strive for accuracy, we make no warranties, expressed or implied, regarding the absolute accuracy of the results. The website shall not be liable for any errors or any actions taken based on these results.</p>

                        <h3>Acceptable Use</h3>
                        <p>You agree not to use the website in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website. Automated data extraction (scraping) is prohibited.</p>

                        <h3>Modifications</h3>
                        <p>We reserve the right to revise these terms of use at any time without notice. By using this website you are agreeing to be bound by the current version of these terms.</p>
                    </>
                )}
            </div>
        </div>
    );
}