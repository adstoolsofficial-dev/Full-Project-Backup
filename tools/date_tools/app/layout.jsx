import './globals.css';
import { promises as fs } from 'fs';
import path from 'path';

export async function generateMetadata() {
  let siteTitle = 'أدوات التاريخ الشاملة';
  let siteDescription = 'أداة شاملة لحساب العمر وتحويل التواريخ بدقة';

  try {
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

  return {
    title: siteTitle,
    description: siteDescription,
    icons: {
      icon: '/favicon.ico',
    },
  };
}

export default function RootLayout({ children }) { 
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}