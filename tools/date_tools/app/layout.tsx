import type { Metadata } from 'next';
import './globals.css';
import { promises as fs } from 'fs';
import path from 'path';

export async function generateMetadata(): Promise<Metadata> {
  // 1. قيم افتراضية قوية
  let siteTitle = 'أدوات التاريخ الشاملة';
  let siteDescription = 'أداة شاملة لحساب العمر وتحويل التواريخ بدقة';

  try {
    // 2. قراءة الكونفيج لبيانات الـ SEO فقط
    const filePath = path.join(process.cwd(), 'config.json');
    const data = await fs.readFile(filePath, 'utf8');
    const config = JSON.parse(data);
    
    if (config.mainSEO) {
        if (config.mainSEO.title) siteTitle = config.mainSEO.title;
        if (config.mainSEO.description) siteDescription = config.mainSEO.description;
    }
  } catch (e) {
    console.log("⚠️ تنبيه: لم يتم العثور على config.json سيتم استخدام SEO الافتراضي.");
  }

  // 3. إرسال البيانات (هنا وضعنا المسار السحري الثابت للأيقونة)
  return {
    title: siteTitle,
    description: siteDescription,
    icons: {
      icon: '/favicon.ico', // السيرفر (server.js) سيلتقط هذا المسار ويرسل الصورة الحقيقية
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) { 
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet" />
        {/* تم مسح سطر الـ link rel="icon" من هنا لأن Next.js سيضيفه تلقائياً وبشكل صحيح بناءً على الميتا داتا */}
      </head>
      <body>{children}</body>
    </html>
  );
}