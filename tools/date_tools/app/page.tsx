'use client';
import { useState, useEffect } from 'react';
import Script from 'next/script';
import { initAndTrackVisit, trackToolUsage } from './firebase';
import Header from './Header';
import Footer from './Footer';

const i18n: Record<string, any> = {
    ar: {
        pageTitle: "أدوات التاريخ الشاملة", hCalcAge: "احسب عمرك بدقة", hGreg: "بالتاريخ الميلادي", hHijri: "بالتاريخ الهجري",
        lblBirth: "أدخل تاريخ ميلادك:", btnCalc: "احسب العمر", hConv: "تحويل التاريخ", hG2H: "ميلادي إلى هجري", hH2G: "هجري إلى ميلادي",
        lblGreg: "التاريخ الميلادي:", lblHijri: "التاريخ الهجري:", btnG2H: "تحويل لهجري", btnH2G: "تحويل لميلادي",
        hDiff: "حساب المدة بين تاريخين", hDiffGreg: "بالميلادي", hDiffHijri: "بالهجري", lblDate1: "التاريخ الأول:", lblDate2: "التاريخ الثاني:",
        btnDiff: "احسب المدة", adPortal: "مساحة إعلانية مميزة", navHome: "الرئيسية", navPortal: "بوابة المعلنين",
        rights: "جميع الحقوق محفوظة", footerPortal: "بوابة أدوات التاريخ", adBanner1: "مساحة إعلانية (بانر 1)", adBanner2: "مساحة إعلانية (بانر 2)",
        day: "اليوم", month: "الشهر", year: "السنة", errSelect: "الرجاء اختيار التاريخ كاملاً", errFuture: "التاريخ لا يمكن أن يكون في المستقبل!",
        resAge: "عمرك هو:", resAgeH: "عمرك بالهجري:", resDiffText: "المدة بينهما:", resG2H: "يوافق هجرياً:", resH2G: "يوافق ميلادياً:", sameDay: "اليوم (نفس التاريخ)",
        y1: "سنة", y2: "سنتين", y3: "سنوات", y4: "سنة", m1: "شهر", m2: "شهرين", m3: "أشهر", m4: "شهر", d1: "يوم", d2: "يومين", d3: "أيام", d4: "يوم", and: " و "
    },
    en: {
        pageTitle: "Comprehensive Date Tools", hCalcAge: "Calculate Your Age", hGreg: "Gregorian Date", hHijri: "Hijri Date",
        lblBirth: "Enter your birth date:", btnCalc: "Calculate Age", hConv: "Date Conversion", hG2H: "Gregorian to Hijri", hH2G: "Hijri to Gregorian",
        lblGreg: "Gregorian Date:", lblHijri: "Hijri Date:", btnG2H: "Convert to Hijri", btnH2G: "Convert to Gregorian",
        hDiff: "Duration Between Dates", hDiffGreg: "In Gregorian", hDiffHijri: "In Hijri", lblDate1: "First Date:", lblDate2: "Second Date:",
        btnDiff: "Calculate Duration", adPortal: "Advertisers Portal - Click here to login & manage ads", navHome: "Home", navPortal: "Advertisers Portal",
        rights: "All Rights Reserved", footerPortal: "Date Tools Portal", adBanner1: "Ad Space (Banner 1)", adBanner2: "Ad Space (Banner 2)",
        day: "Day", month: "Month", year: "Year", errSelect: "Please select the complete date", errFuture: "Date cannot be in the future!",
        resAge: "Your age is:", resAgeH: "Your Hijri age is:", resDiffText: "Duration between them:", resG2H: "Hijri equivalent:", resH2G: "Gregorian equivalent:", sameDay: "Today (Same Date)",
        y1: "year", y2: "years", y3: "years", y4: "years", m1: "month", m2: "months", m3: "months", m4: "months", d1: "day", d2: "days", d3: "days", d4: "days", and: " and "
    }
};

const monthNames: Record<string, any> = {
    ar: { greg: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'], hijri: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'] },
    en: { greg: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], hijri: ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaaban', 'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'] }
};

const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export default function Home() {
    const [lang, setLang] = useState('ar');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ show: false, msg: '', type: '' });

    const [gAgeInput, setGAgeInput] = useState({ d: '', m: '', y: '' });
    const [hAgeInput, setHAgeInput] = useState({ d: '', m: '', y: '' });
    const [gConvInput, setGConvInput] = useState({ d: '', m: '', y: '' });
    const [hConvInput, setHConvInput] = useState({ d: '', m: '', y: '' });
    const [gDiffInput1, setGDiffInput1] = useState({ d: '', m: '', y: '' });
    const [gDiffInput2, setGDiffInput2] = useState({ d: '', m: '', y: '' });
    const [hDiffInput1, setHDiffInput1] = useState({ d: '', m: '', y: '' });
    const [hDiffInput2, setHDiffInput2] = useState({ d: '', m: '', y: '' });

    const [resAgeGreg, setResAgeGreg] = useState<string | null>(null);
    const [resAgeHijri, setResAgeHijri] = useState<string | null>(null);
    const [resHijriConv, setResHijriConv] = useState<string | null>(null);
    const [resGregConv, setResGregConv] = useState<string | null>(null);
    const [resDiffGreg, setResDiffGreg] = useState<string | null>(null);
    const [resDiffHijri, setResDiffHijri] = useState<string | null>(null);

    // الحالات الجديدة للمميزات
    const [todayInfo, setTodayInfo] = useState('');
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const [enteredDateInfo, setEnteredDateInfo] = useState<{title: string, info: string, shareText: string} | null>(null);

    useEffect(() => {
        const savedLang = localStorage.getItem('site_lang') || 'ar';
        setLang(savedLang);
        
        const osThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const savedTheme = localStorage.getItem('site_theme');
        setIsDarkMode(savedTheme ? savedTheme === 'dark' : osThemeQuery.matches);

        initAndTrackVisit();
        generateTodayAndEvents(); // توليد المواعيد ومعلومات اليوم تلقائياً
    }, []);

    useEffect(() => {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        if (isDarkMode) document.body.classList.add('dark-mode');
        else document.body.classList.remove('dark-mode');
    }, [lang, isDarkMode]);

    const toggleLang = () => {
        const newLang = lang === 'ar' ? 'en' : 'ar';
        setLang(newLang);
        localStorage.setItem('site_lang', newLang);
        clearResults();
    };

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        localStorage.setItem('site_theme', newTheme ? 'dark' : 'light');
    };

    const clearResults = () => {
        setResAgeGreg(null); setResAgeHijri(null); setResHijriConv(null);
        setResGregConv(null); setResDiffGreg(null); setResDiffHijri(null);
        setEnteredDateInfo(null);
    }

    const showNotification = (messageKey: string, type = 'error') => {
        setAlertConfig({ show: true, msg: i18n[lang][messageKey] || messageKey, type });
        setTimeout(() => setAlertConfig({ show: false, msg: '', type: '' }), 3000);
    };

    // ==========================================
    // 🧠 1. مكتبة الأحداث الذكية السعودية
    // ==========================================
    const generateTodayAndEvents = () => {
        const today = new Date();
        const hParts = getHijriParts(today);
        const currentDayName = daysAr[today.getDay()];
        
        setTodayInfo(`اليوم ${currentDayName}، ${today.getDate()} ${monthNames['ar'].greg[today.getMonth()]} م | ${hParts.d} ${monthNames['ar'].hijri[hParts.m - 1]} هـ`);

        let events: any[] = [];
        const maxDays = 60; // إظهار الأحداث التي تقع خلال الـ 60 يوم القادمة فقط

        // دالة مساعدة للأحداث الشهرية الميلادية (الرواتب، الدعم...)
        const addMonthlyEvent = (day: number, name: string, icon: string, color: string) => {
            let target = new Date(today.getFullYear(), today.getMonth(), day);
            if (today.getDate() > day) target.setMonth(target.getMonth() + 1);
            let diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (diff <= maxDays) events.push({ name, days: diff, icon, color });
        };

        // دالة مساعدة للأحداث الوطنية الثابتة
        const addNationalEvent = (month: number, day: number, name: string, icon: string, color: string) => {
            let target = new Date(today.getFullYear(), month - 1, day);
            if (today > target) target.setFullYear(target.getFullYear() + 1);
            let diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (diff <= maxDays) events.push({ name, days: diff, icon, color });
        };

        // دالة مساعدة للأحداث الهجرية
        const addHijriEvent = (hMonth: number, hDay: number, name: string, icon: string, color: string) => {
            let targetYear = hParts.m > hMonth || (hParts.m === hMonth && hParts.d > hDay) ? hParts.y + 1 : hParts.y;
            let targetGreg = hijriToGregorian(targetYear, hMonth, hDay);
            let diff = Math.ceil((targetGreg.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (diff >= 0 && diff <= maxDays) events.push({ name, days: diff, icon, color });
        };

        // 1. الأحداث والمواعيد الحكومية السعودية
        addMonthlyEvent(27, 'الرواتب (القطاع العام)', 'fa-money-bill-wave', '#10b981');
        addMonthlyEvent(10, 'إيداع حساب المواطن', 'fa-house-user', '#3b82f6');
        addMonthlyEvent(1, 'الضمان الاجتماعي المطور', 'fa-hands-holding-child', '#2563eb');
        addMonthlyEvent(1, 'التأمينات الاجتماعية', 'fa-shield-heart', '#059669');
        addMonthlyEvent(5, 'إعانة حافز', 'fa-briefcase', '#0ea5e9');
        addMonthlyEvent(25, 'معاشات التقاعد', 'fa-person-cane', '#475569');

        // 2. الأحداث الوطنية
        addNationalEvent(9, 23, 'اليوم الوطني السعودي', 'fa-flag', '#16a34a');
        addNationalEvent(2, 22, 'يوم التأسيس السعودي', 'fa-monument', '#92400e');

        // 3. الأحداث الدينية والأعياد
        addHijriEvent(9, 1, 'بداية شهر رمضان', 'fa-moon', '#8b5cf6');
        addHijriEvent(10, 1, 'عيد الفطر المبارك', 'fa-gift', '#f59e0b');
        addHijriEvent(12, 9, 'يوم عرفة', 'fa-mountain-sun', '#0d9488');
        addHijriEvent(12, 10, 'عيد الأضحى المبارك', 'fa-kaaba', '#14b8a6');
        addHijriEvent(1, 1, 'رأس السنة الهجرية', 'fa-star-and-crescent', '#6366f1');

        events.sort((a, b) => a.days - b.days);
        setUpcomingEvents(events);
    };

    // دالة مشاركة قائمة المواعيد
    const handleShareEvents = async () => {
        if (upcomingEvents.length === 0) return;
        
        let shareBody = `📅 *أهم المواعيد السعودية القادمة*\n`;
        shareBody += `————————————————\n`;
        
        upcomingEvents.forEach(evt => {
            const daysText = evt.days === 0 ? '🕒 يصرف/يوافق اليوم!' : `⏳ متبقي: ${evt.days} يوم`;
            shareBody += `🔹 *${evt.name}*\n${daysText}\n\n`;
        });
        
        shareBody += `————————————————\n🔗 تابع المواعيد بدقة عبر أدوات التاريخ:\n${window.location.href}`;

        if (navigator.share) {
            try { await navigator.share({ title: 'المواعيد السعودية القادمة', text: shareBody }); } catch (err) {}
        } else {
            navigator.clipboard.writeText(shareBody);
            showNotification('تم نسخ القائمة كرسالة نصية!', 'info');
        }
    };

    // دالة توليد قصة التاريخ المُدخل
    const generateDateStory = (gregDate: Date, title: string, rawResultText: string) => {
        const dName = daysAr[gregDate.getDay()];
        const m = gregDate.getMonth() + 1;
        let season = '';
        if(m >= 3 && m <= 5) season = 'الربيع 🌸';
        else if(m >= 6 && m <= 8) season = 'الصيف ☀️';
        else if(m >= 9 && m <= 11) season = 'الخريف 🍂';
        else season = 'الشتاء ❄️';

        const isLeap = new Date(gregDate.getFullYear(), 1, 29).getMonth() === 1 ? 'نعم' : 'لا';
        const info = `يوافق يوم ${dName} • فصل ${season} • سنة كبيسة: ${isLeap}`;
        
        const shareText = `*أدوات التاريخ الشاملة* 📅\n\n📌 ${title}\nالنتيجة: ${rawResultText}\n\n💡 هل تعلم؟\nهذا التاريخ يوافق يوم ${dName} وكان في فصل ${season}.\n\n🔗 جرب الأداة بنفسك:\n${window.location.href}`;
        setEnteredDateInfo({ title, info, shareText });
    };

    const handleShareResult = async () => {
        if (!enteredDateInfo) return;
        if (navigator.share) {
            try { await navigator.share({ title: 'نتيجة أدوات التاريخ', text: enteredDateInfo.shareText }); } catch (err) {}
        } else {
            navigator.clipboard.writeText(enteredDateInfo.shareText);
            showNotification('تم نسخ النتيجة للمشاركة!', 'info');
        }
    };

    // ==========================================
    // ⚙️ 2. الدوال الحسابية الأساسية
    // ==========================================
    const formatDuration = (years: number, months: number, days: number) => {
        const dict = i18n[lang];
        const formatPart = (val: number, s: string, d: string, p: string, dp: string) => {
            if (val === 0) return "";
            if (lang === 'en') return val === 1 ? `1 ${s}` : `${val} ${p}`;
            if (val === 1) return s; if (val === 2) return d;
            if (val >= 3 && val <= 10) return `${val} ${p}`;
            return `${val} ${dp}`;
        };
        const parts = [
            formatPart(years, dict.y1, dict.y2, dict.y3, dict.y4),
            formatPart(months, dict.m1, dict.m2, dict.m3, dict.m4),
            formatPart(days, dict.d1, dict.d2, dict.d3, dict.d4)
        ].filter(p => p !== "");
        return parts.length === 0 ? dict.sameDay : parts.join(dict.and);
    };

    const getExactDifference = (d1: Date, d2: Date) => {
        const start = new Date(Math.min(d1.getTime(), d2.getTime()));
        const end = new Date(Math.max(d1.getTime(), d2.getTime()));
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();
        if (days < 0) { months--; const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0); days += prevMonth.getDate(); }
        if (months < 0) { years--; months += 12; }
        return { years, months, days };
    };

    const getHijriParts = (dateObj: Date) => {
        const parts = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(dateObj);
        let y = 0, m = 0, d = 0;
        parts.forEach(p => { if(p.type === 'year') y = parseInt(p.value); if(p.type === 'month') m = parseInt(p.value); if(p.type === 'day') d = parseInt(p.value); });
        return { y, m, d };
    };

    const hijriToGregorian = (hY: number, hM: number, hD: number) => {
        let target = hY * 10000 + hM * 100 + hD; 
        let minDays = Math.floor(new Date(1900, 0, 1).getTime() / 86400000); 
        let maxDays = Math.floor(new Date(2100, 11, 31).getTime() / 86400000);
        let resultDays = minDays;
        for (let i = 0; i < 20; i++) {
            let midDays = Math.floor((minDays + maxDays) / 2); 
            let midDate = new Date(midDays * 86400000); 
            let p = getHijriParts(midDate); 
            let midVal = p.y * 10000 + p.m * 100 + p.d;
            if (midVal === target) { resultDays = midDays; break; } 
            else if (midVal < target) { minDays = midDays + 1; } 
            else { maxDays = midDays - 1; }
        }
        return new Date(resultDays * 86400000);
    };

    const calculateAgeGreg = () => {
        clearResults();
        const { d, m, y } = gAgeInput;
        if (!d || !m || !y) return showNotification("errSelect");
        const birthDate = new Date(`${y}-${m}-${d}`); const today = new Date();
        if (birthDate > today) return showNotification("errFuture");
        const diff = getExactDifference(birthDate, today);
        const durationStr = formatDuration(diff.years, diff.months, diff.days);
        
        setResAgeGreg(`${i18n[lang].resAge} <br><span style="color:inherit;">${durationStr}</span>`);
        generateDateStory(birthDate, 'حساب العمر (ميلادي)', durationStr);
        trackToolUsage('ageCalc');
    };

    const calculateAgeHijri = () => {
        clearResults();
        const { d, m, y } = hAgeInput;
        if (!d || !m || !y) return showNotification("errSelect");
        const bDay = parseInt(d), bMonth = parseInt(m), bYear = parseInt(y);
        const tp = getHijriParts(new Date()); 
        const tDay = tp.d, tMonth = tp.m, tYear = tp.y;
        
        if (bYear > tYear || (bYear === tYear && bMonth > tMonth) || (bYear === tYear && bMonth === tMonth && bDay > tDay)) return showNotification("errFuture");
        
        let years = tYear - bYear, months = tMonth - bMonth, days = tDay - bDay;
        if (days < 0) { months--; days += 30; } 
        if (months < 0) { years--; months += 12; }
        
        const durationStr = formatDuration(years, months, days);
        setResAgeHijri(`${i18n[lang].resAgeH} <br><span style="color:inherit;">${durationStr}</span>`);
        
        const gregEquivalent = hijriToGregorian(bYear, bMonth, bDay);
        generateDateStory(gregEquivalent, 'حساب العمر (هجري)', durationStr);
        trackToolUsage('ageCalc');
    };

    const convertGregToHijri = () => {
        clearResults();
        const { d, m, y } = gConvInput;
        if (!d || !m || !y) return showNotification("errSelect");
        const gDate = new Date(`${y}-${m}-${String(d).padStart(2, '0')}`);
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', calendar: 'islamic-umalqura' };
        const locale = lang === 'ar' ? 'ar-SA-u-ca-islamic-umalqura' : 'en-US-u-ca-islamic-umalqura';
        const hDate = new Intl.DateTimeFormat(locale, options).format(gDate);
        
        setResHijriConv(`${i18n[lang].resG2H} <br><span style="color:inherit;">${hDate}</span>`);
        generateDateStory(gDate, 'تحويل ميلادي إلى هجري', hDate);
        trackToolUsage('dateConverter');
    };

    const convertHijriToGreg = () => {
        clearResults();
        const { d, m, y } = hConvInput;
        if (!d || !m || !y) return showNotification("errSelect");
        let gDateObj = hijriToGregorian(parseInt(y), parseInt(m), parseInt(d));
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }; 
        const locale = lang === 'ar' ? 'ar-SA' : 'en-US';
        const gDateFormatted = new Intl.DateTimeFormat(locale, options).format(gDateObj);
        const suffix = lang === 'ar' ? ' م' : '';
        const finalRes = `${gDateFormatted}${suffix}`;
        
        setResGregConv(`${i18n[lang].resH2G} <br><span style="color:inherit;">${finalRes}</span>`);
        generateDateStory(gDateObj, 'تحويل هجري إلى ميلادي', finalRes);
        trackToolUsage('dateConverter');
    };

    const calcDiffGreg = () => {
        clearResults();
        const { d: d1, m: m1, y: y1 } = gDiffInput1;
        const { d: d2, m: m2, y: y2 } = gDiffInput2;
        if (!d1 || !m1 || !y1 || !d2 || !m2 || !y2) return showNotification("errSelect");
        const date1 = new Date(`${y1}-${m1}-${d1}`);
        const date2 = new Date(`${y2}-${m2}-${d2}`);
        const diff = getExactDifference(date1, date2);
        const durationStr = formatDuration(diff.years, diff.months, diff.days);
        
        setResDiffGreg(`${i18n[lang].resDiffText} <br><span style="color:inherit;">${durationStr}</span>`);
        setEnteredDateInfo(null);
        trackToolUsage('durationCalc');
    };

    const calcDiffHijri = () => {
        clearResults();
        const { d: d1Val, m: m1Val, y: y1Val } = hDiffInput1;
        const { d: dh2Val, m: mh2Val, y: yh2Val } = hDiffInput2;
        if (!d1Val || !m1Val || !y1Val || !dh2Val || !mh2Val || !yh2Val) return showNotification("errSelect");
        
        let y1 = parseInt(y1Val), m1 = parseInt(m1Val), d1 = parseInt(d1Val); 
        let y2 = parseInt(yh2Val), m2 = parseInt(mh2Val), d2 = parseInt(dh2Val);
        
        if (y1 > y2 || (y1 === y2 && m1 > m2) || (y1 === y2 && m1 === m2 && d1 > d2)) { 
            let ty = y1, tm = m1, td = d1; 
            y1 = y2; m1 = m2; d1 = d2; 
            y2 = ty; m2 = tm; d2 = td; 
        }
        
        let years = y2 - y1, months = m2 - m1, days = d2 - d1;
        if (days < 0) { months--; days += 30; } 
        if (months < 0) { years--; months += 12; }
        
        const durationStr = formatDuration(years, months, days);
        setResDiffHijri(`${i18n[lang].resDiffText} <br><span style="color:inherit;">${durationStr}</span>`);
        setEnteredDateInfo(null);
        trackToolUsage('durationCalc');
    };

    const renderDays = (max: number) => Array.from({ length: max }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>);
    const renderMonths = (names: string[], isGreg: boolean) => names.map((name, i) => {
        const val = isGreg ? String(i + 1).padStart(2, '0') : i + 1;
        return <option key={val} value={val}>{name}</option>;
    });
    const renderYears = (start: number, end: number) => {
        const arr = [];
        for (let i = start; i >= end; i--) arr.push(<option key={i} value={i}>{i}</option>);
        return arr;
    };

    // مكوّن عرض النتيجة + القصة + زر المشاركة
    const ResultCard = ({ htmlContent }: { htmlContent: string }) => (
        <div className="result-container">
            <div className="result" style={{ display: 'block' }} dangerouslySetInnerHTML={{ __html: htmlContent }}></div>
            {enteredDateInfo && (
                <div className="story-card">
                    <div className="story-content">
                        <i className="fa-solid fa-lightbulb" style={{color: '#f59e0b', marginInlineEnd: '8px'}}></i>
                        <span style={{fontWeight:'bold'}}>{lang==='ar'?'معلومة إضافية:':'Date Info:'}</span>
                        <p>{enteredDateInfo.info}</p>
                    </div>
                    <button className="share-btn" onClick={handleShareResult}>
                        <i className="fa-solid fa-share-nodes"></i> {lang==='ar'?'مشاركة النتيجة':'Share Result'}
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <>
            <div className={`custom-alert ${alertConfig.show ? 'show' : ''} ${alertConfig.type === 'info' ? 'info' : ''}`}>
                <i className={alertConfig.type === 'error' ? "fa-solid fa-circle-exclamation" : "fa-solid fa-circle-check"}></i>
                {alertConfig.msg}
            </div>

            <div className="container">
                <Header lang={lang} isDarkMode={isDarkMode} toggleLang={toggleLang} toggleTheme={toggleTheme} />

                {/* --- معلومات اليوم المطور --- */}
                {lang === 'ar' && (
                    <div className="today-info-banner">
                        <div className="today-content">
                            <i className="fa-regular fa-calendar-check"></i>
                            <span>{todayInfo}</span>
                        </div>
                    </div>
                )}

                <div className="ad-placeholder" data-ad-location="top-banner">
                    <ins className="adsbygoogle" style={{ display: "block" }} data-ad-client="ca-pub-1147243690926079" data-ad-slot="7882868833" data-ad-format="auto" data-full-width-responsive="true"></ins>
                    <Script id="adsbygoogle-init" strategy="afterInteractive">{`(adsbygoogle = window.adsbygoogle || []).push({});`}</Script>
                </div>

                {/* --- مكتبة المواعيد السعودية القادمة --- */}
                {lang === 'ar' && upcomingEvents.length > 0 && (
                    <div className="events-wrapper">
                        <div className="events-header">
                            <h3 className="section-header-title"><i className="fa-solid fa-bolt" style={{color: '#f59e0b'}}></i> مواعيد تهمك في السعودية</h3>
                            <button className="share-events-btn" onClick={handleShareEvents}>
                                <i className="fa-solid fa-share-nodes"></i> مشاركة المواعيد
                            </button>
                        </div>
                        <div className="events-grid">
                            {upcomingEvents.map((evt, idx) => (
                                <div className="event-card" key={idx} style={{ borderRightColor: evt.color }}>
                                    <div className="evt-icon" style={{ backgroundColor: `${evt.color}15`, color: evt.color }}>
                                        <i className={`fa-solid ${evt.icon}`}></i>
                                    </div>
                                    <div className="evt-details">
                                        <div className="evt-name">{evt.name}</div>
                                        <div className="evt-days">{evt.days === 0 ? 'يصرف/يوافق اليوم!' : `متبقي ${evt.days} يوم`}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- حاسبة العمر --- */}
                <div className="card">
                    <h2>{i18n[lang].hCalcAge}</h2>
                    <div className="split-section">
                        <div>
                            <h3>{i18n[lang].hGreg}</h3>
                            <label>{i18n[lang].lblBirth}</label>
                            <div className="date-dropdowns">
                                <select value={gAgeInput.d} onChange={(e) => setGAgeInput({...gAgeInput, d: e.target.value})}><option value="">{i18n[lang].day}</option>{renderDays(31)}</select>
                                <select value={gAgeInput.m} onChange={(e) => setGAgeInput({...gAgeInput, m: e.target.value})}><option value="">{i18n[lang].month}</option>{renderMonths(monthNames[lang].greg, true)}</select>
                                <select value={gAgeInput.y} onChange={(e) => setGAgeInput({...gAgeInput, y: e.target.value})}><option value="">{i18n[lang].year}</option>{renderYears(2026, 1900)}</select>
                            </div>
                            <button className="action-btn" onClick={calculateAgeGreg}>
                                <i className="fa-solid fa-calculator"></i> <span>{i18n[lang].btnCalc}</span>
                            </button>
                            {resAgeGreg && <ResultCard htmlContent={resAgeGreg} />}
                        </div>
                        <div>
                            <h3>{i18n[lang].hHijri}</h3>
                            <label>{i18n[lang].lblBirth}</label>
                            <div className="date-dropdowns">
                                <select value={hAgeInput.d} onChange={(e) => setHAgeInput({...hAgeInput, d: e.target.value})}><option value="">{i18n[lang].day}</option>{renderDays(30)}</select>
                                <select value={hAgeInput.m} onChange={(e) => setHAgeInput({...hAgeInput, m: e.target.value})}><option value="">{i18n[lang].month}</option>{renderMonths(monthNames[lang].hijri, false)}</select>
                                <select value={hAgeInput.y} onChange={(e) => setHAgeInput({...hAgeInput, y: e.target.value})}><option value="">{i18n[lang].year}</option>{renderYears(1447, 1300)}</select>
                            </div>
                            <button className="action-btn" onClick={calculateAgeHijri}>
                                <i className="fa-solid fa-calculator"></i> <span>{i18n[lang].btnCalc}</span>
                            </button>
                            {resAgeHijri && <ResultCard htmlContent={resAgeHijri} />}
                        </div>
                    </div>
                </div>

                <div id="customAdContainer" data-ad-location="middle-banner">
                    <a href="https://ads-tools-official.com" style={{textDecoration: 'none', display: 'block'}}>
                        <div className="ad-placeholder custom-ad-promo">
                            <i className="fa-solid fa-star"></i> <span>{i18n[lang].adPortal}</span> <i className="fa-solid fa-star"></i>
                        </div>
                    </a>
                </div>

                {/* --- تحويل التاريخ --- */}
                <div className="card">
                    <h2>{i18n[lang].hConv}</h2>
                    <div className="split-section">
                        <div>
                            <h3>{i18n[lang].hG2H}</h3>
                            <label>{i18n[lang].lblGreg}</label>
                            <div className="date-dropdowns">
                                <select value={gConvInput.d} onChange={(e) => setGConvInput({...gConvInput, d: e.target.value})}><option value="">{i18n[lang].day}</option>{renderDays(31)}</select>
                                <select value={gConvInput.m} onChange={(e) => setGConvInput({...gConvInput, m: e.target.value})}><option value="">{i18n[lang].month}</option>{renderMonths(monthNames[lang].greg, true)}</select>
                                <select value={gConvInput.y} onChange={(e) => setGConvInput({...gConvInput, y: e.target.value})}><option value="">{i18n[lang].year}</option>{renderYears(2026, 1900)}</select>
                            </div>
                            <button className="action-btn" onClick={convertGregToHijri}>
                                <i className="fa-solid fa-rotate"></i> <span>{i18n[lang].btnG2H}</span>
                            </button>
                            {resHijriConv && <ResultCard htmlContent={resHijriConv} />}
                        </div>
                        <div>
                            <h3>{i18n[lang].hH2G}</h3>
                            <label>{i18n[lang].lblHijri}</label>
                            <div className="date-dropdowns">
                                <select value={hConvInput.d} onChange={(e) => setHConvInput({...hConvInput, d: e.target.value})}><option value="">{i18n[lang].day}</option>{renderDays(30)}</select>
                                <select value={hConvInput.m} onChange={(e) => setHConvInput({...hConvInput, m: e.target.value})}><option value="">{i18n[lang].month}</option>{renderMonths(monthNames[lang].hijri, false)}</select>
                                <select value={hConvInput.y} onChange={(e) => setHConvInput({...hConvInput, y: e.target.value})}><option value="">{i18n[lang].year}</option>{renderYears(1447, 1300)}</select>
                            </div>
                            <button className="action-btn" onClick={convertHijriToGreg}>
                                <i className="fa-solid fa-rotate"></i> <span>{i18n[lang].btnH2G}</span>
                            </button>
                            {resGregConv && <ResultCard htmlContent={resGregConv} />}
                        </div>
                    </div>
                </div>

                {/* --- الفرق بين تاريخين --- */}
                <div className="card">
                    <h2>{i18n[lang].hDiff}</h2>
                    <div className="split-section">
                        <div>
                            <h3>{i18n[lang].hDiffGreg}</h3>
                            <label>{i18n[lang].lblDate1}</label>
                            <div className="date-dropdowns">
                                <select value={gDiffInput1.d} onChange={(e) => setGDiffInput1({...gDiffInput1, d: e.target.value})}><option value="">{i18n[lang].day}</option>{renderDays(31)}</select>
                                <select value={gDiffInput1.m} onChange={(e) => setGDiffInput1({...gDiffInput1, m: e.target.value})}><option value="">{i18n[lang].month}</option>{renderMonths(monthNames[lang].greg, true)}</select>
                                <select value={gDiffInput1.y} onChange={(e) => setGDiffInput1({...gDiffInput1, y: e.target.value})}><option value="">{i18n[lang].year}</option>{renderYears(2026, 1900)}</select>
                            </div>
                            <label>{i18n[lang].lblDate2}</label>
                            <div className="date-dropdowns">
                                <select value={gDiffInput2.d} onChange={(e) => setGDiffInput2({...gDiffInput2, d: e.target.value})}><option value="">{i18n[lang].day}</option>{renderDays(31)}</select>
                                <select value={gDiffInput2.m} onChange={(e) => setGDiffInput2({...gDiffInput2, m: e.target.value})}><option value="">{i18n[lang].month}</option>{renderMonths(monthNames[lang].greg, true)}</select>
                                <select value={gDiffInput2.y} onChange={(e) => setGDiffInput2({...gDiffInput2, y: e.target.value})}><option value="">{i18n[lang].year}</option>{renderYears(2026, 1900)}</select>
                            </div>
                            <button className="action-btn" onClick={calcDiffGreg}>
                                <i className="fa-solid fa-clock-rotate-left"></i> <span>{i18n[lang].btnDiff}</span>
                            </button>
                            {resDiffGreg && <ResultCard htmlContent={resDiffGreg} />}
                        </div>
                        <div>
                            <h3>{i18n[lang].hDiffHijri}</h3>
                            <label>{i18n[lang].lblDate1}</label>
                            <div className="date-dropdowns">
                                <select value={hDiffInput1.d} onChange={(e) => setHDiffInput1({...hDiffInput1, d: e.target.value})}><option value="">{i18n[lang].day}</option>{renderDays(30)}</select>
                                <select value={hDiffInput1.m} onChange={(e) => setHDiffInput1({...hDiffInput1, m: e.target.value})}><option value="">{i18n[lang].month}</option>{renderMonths(monthNames[lang].hijri, false)}</select>
                                <select value={hDiffInput1.y} onChange={(e) => setHDiffInput1({...hDiffInput1, y: e.target.value})}><option value="">{i18n[lang].year}</option>{renderYears(1447, 1300)}</select>
                            </div>
                            <label>{i18n[lang].lblDate2}</label>
                            <div className="date-dropdowns">
                                <select value={hDiffInput2.d} onChange={(e) => setHDiffInput2({...hDiffInput2, d: e.target.value})}><option value="">{i18n[lang].day}</option>{renderDays(30)}</select>
                                <select value={hDiffInput2.m} onChange={(e) => setHDiffInput2({...hDiffInput2, m: e.target.value})}><option value="">{i18n[lang].month}</option>{renderMonths(monthNames[lang].hijri, false)}</select>
                                <select value={hDiffInput2.y} onChange={(e) => setHDiffInput2({...hDiffInput2, y: e.target.value})}><option value="">{i18n[lang].year}</option>{renderYears(1447, 1300)}</select>
                            </div>
                            <button className="action-btn" onClick={calcDiffHijri}>
                                <i className="fa-solid fa-clock-rotate-left"></i> <span>{i18n[lang].btnDiff}</span>
                            </button>
                            {resDiffHijri && <ResultCard htmlContent={resDiffHijri} />}
                        </div>
                    </div>
                </div>

                <div className="bottom-banners-grid">
                    <div className="ad-placeholder" data-ad-location="bottom-banner-1">{i18n[lang].adBanner1}</div>
                    <div className="ad-placeholder" data-ad-location="bottom-banner-2">{i18n[lang].adBanner2}</div>
                </div>

                {/* ==========================================
                    🚀 3. أقسام السيو (SEO) الغنية
                    ========================================== */}
                {lang === 'ar' && (
                    <div className="seo-sections-wrapper">
                        
                        {/* الدليل والأهمية */}
                        <section className="seo-card">
                            <h2 className="seo-title"><i className="fa-solid fa-book-open"></i> دليلك لمعرفة أهمية تحويل التواريخ</h2>
                            <p className="seo-text">
                                في حياتنا اليومية والعملية، تلعب التواريخ دوراً محورياً في تنظيم التزاماتنا. في المملكة العربية السعودية، تتداخل الاستخدامات بين التقويم الميلادي (المرتبط بالرواتب والأعمال العالمية) والتقويم الهجري (المرتبط بالمناسبات الدينية، الأحوال المدنية، والمعاملات الرسمية).
                            </p>
                            <p className="seo-text">
                                <strong>لماذا هذه الأداة مفيدة لك؟</strong><br/>
                                تتيح لك الأداة التخطيط المسبق لحياتك؛ فمن خلال معرفة عمرك الدقيق تستطيع تحديد مواعيد استحقاقك للخدمات الحكومية (مثل استخراج الهوية، الضمان، أو التقاعد). كما يساعدك تحويل التواريخ في مطابقة العقود الإيجارية والتجارية التي قد تُكتب بتقويم مختلف.
                            </p>
                        </section>

                        {/* الأسئلة الشائعة (FAQ) */}
                        <section className="seo-card">
                            <h2 className="seo-title"><i className="fa-regular fa-circle-question"></i> الأسئلة الشائعة</h2>
                            
                            <div className="faq-item">
                                <h4 className="faq-q">كيف تعمل حاسبة العمر بالهجري والميلادي؟</h4>
                                <p className="faq-a">تقوم الحاسبة بأخذ تاريخ ميلادك، وتقارنه بالتاريخ الحالي. وبناءً على خوارزميات رياضية دقيقة، تستخرج عدد السنوات، ثم الأشهر، والأيام المتبقية لتعطيك عمرك بالتفصيل.</p>
                            </div>
                            <div className="faq-item">
                                <h4 className="faq-q">هل محول التاريخ الهجري يعتمد على تقويم أم القرى؟</h4>
                                <p className="faq-a">نعم، تم بناء معادلات التحويل في برمجياتنا لتتوافق تماماً مع "تقويم أم القرى" المعتمد رسمياً في المملكة العربية السعودية، لضمان أعلى مستويات الدقة.</p>
                            </div>
                            <div className="faq-item">
                                <h4 className="faq-q">ما الفرق الأساسي بين السنة الكبيسة والبسيطة؟</h4>
                                <p className="faq-a">السنة الميلادية البسيطة عدد أيامها 365 يوماً، بينما السنة الكبيسة تحدث كل 4 سنوات وعدد أيامها 366 يوماً (يُضاف يوم لشهر فبراير). أداتنا تأخذ هذه التغيرات في الحسبان تلقائياً.</p>
                            </div>
                        </section>
                    </div>
                )}
            </div>
            <Footer lang={lang} i18n={i18n} />
        </>
    );
}