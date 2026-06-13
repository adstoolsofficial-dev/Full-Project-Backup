import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
    const configPath = path.join(process.cwd(), 'config.json');
    try {
        const fileContents = fs.readFileSync(configPath, 'utf8');
        return NextResponse.json(JSON.parse(fileContents));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read config' }, { status: 500 });
    }
}

export async function POST(request) {
    const configPath = path.join(process.cwd(), 'config.json');
    try {
        const data = await request.json();
        const fileContents = fs.readFileSync(configPath, 'utf8');
        const existingConfig = JSON.parse(fileContents);
        
        // تحديث الحقول المخصصة للأداة
        existingConfig.toolDisplayName = data.toolDisplayName !== undefined ? data.toolDisplayName : existingConfig.toolDisplayName;
        existingConfig.toolSlogan = data.toolSlogan !== undefined ? data.toolSlogan : existingConfig.toolSlogan;
        existingConfig.externalLinks = data.externalLinks !== undefined ? data.externalLinks : existingConfig.externalLinks;
        
        fs.writeFileSync(configPath, JSON.stringify(existingConfig, null, 4), 'utf8');
        return NextResponse.json({ success: true, config: existingConfig });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to write config' }, { status: 500 });
    }
}