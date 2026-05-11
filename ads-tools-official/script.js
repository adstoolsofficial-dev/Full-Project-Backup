document.addEventListener('DOMContentLoaded', () => {
    // 1. تأثير الشريط العلوي عند التمرير (النزول للأسفل)
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            // إضافة ظل وخلفية بيضاء صلبة عند النزول
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        } else {
            // العودة للشكل الشفاف في الأعلى
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
        }
    });

    // 2. زر القائمة في الجوال (Mobile Menu Toggle)
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    mobileBtn.addEventListener('click', () => {
        // تبديل الكلاس لفتح وإغلاق القائمة
        navLinks.classList.toggle('active');
        
        // تغيير أيقونة الزر بين (الخطوط الثلاثة) و (علامة X)
        const icon = mobileBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });

    // إغلاق القائمة عند النقر على أي رابط (في الجوال)
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                navLinks.classList.remove('active');
                mobileBtn.querySelector('i').classList.remove('fa-xmark');
                mobileBtn.querySelector('i').classList.add('fa-bars');
            }
        });
    });
});