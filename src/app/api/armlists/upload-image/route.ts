import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const type = formData.get('type') as string || 'squad';

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не предоставлен' },
        { status: 400 }
      );
    }

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Файл должен быть изображением' },
        { status: 400 }
      );
    }

    // Проверка размера (макс 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Файл слишком большой (макс 10MB)' },
        { status: 400 }
      );
    }

    // Определяем директорию для сохранения
    const uploadDir = type === 'squad' 
      ? join(process.cwd(), 'public', 'images', 'squads')
      : join(process.cwd(), 'public', 'images', 'machines');

    // Создаем директорию если не существует
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}_${random}.${extension}`;
    const filepath = join(uploadDir, filename);

    // Конвертируем File в Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Сохраняем файл
    await writeFile(filepath, buffer);

    // Возвращаем путь относительно public
    const publicPath = type === 'squad'
      ? `/images/squads/${filename}`
      : `/images/machines/${filename}`;

    return NextResponse.json({ 
      success: true, 
      path: publicPath,
      filename 
    });
  } catch (error) {
    console.error('Ошибка загрузки изображения:', error);
    return NextResponse.json(
      { error: 'Ошибка загрузки изображения' },
      { status: 500 }
    );
  }
}


