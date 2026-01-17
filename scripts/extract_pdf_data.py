#!/usr/bin/env python3
"""Extract army list data from bp_all_armsheets.pdf"""

import subprocess
import json

def fix_encoding(text):
    """Исправляет кодировку текста из PDF"""
    # Упрощенная таблица перекодировки CP1252 -> CP1251
    char_map = {
        '\xc0': 'А', '\xc1': 'Б', '\xc2': 'В', '\xc3': 'Г', '\xc4': 'Д',
        '\xc5': 'Е', '\xc6': 'Ж', '\xc7': 'З', '\xc8': 'И', '\xc9': 'Й',
        '\xca': 'К', '\xcb': 'Л', '\xcc': 'М', '\xcd': 'Н', '\xce': 'О',
        '\xcf': 'П', '\xd0': 'Р', '\xd1': 'С', '\xd2': 'Т', '\xd3': 'У',
        '\xd4': 'Ф', '\xd5': 'Х', '\xd6': 'Ц', '\xd7': 'Ч', '\xd8': 'Ш',
        '\xd9': 'Щ', '\xda': 'Ъ', '\xdb': 'Ы', '\xdc': 'Ь', '\xdd': 'Э',
        '\xde': 'Ю', '\xdf': 'Я', '\xe0': 'а', '\xe1': 'б', '\xe2': 'в',
        '\xe3': 'г', '\xe4': 'д', '\xe5': 'е', '\xe6': 'ж', '\xe7': 'з',
        '\xe8': 'и', '\xe9': 'й', '\xea': 'к', '\xeb': 'л', '\xec': 'м',
        '\xed': 'н', '\xee': 'о', '\xef': 'п', '\xf0': 'р', '\xf1': 'с',
        '\xf2': 'т', '\xf3': 'у', '\xf4': 'ф', '\xf5': 'х', '\xf6': 'ц',
        '\xf7': 'ч', '\xf8': 'ш', '\xf9': 'щ', '\xfa': 'ъ', '\xfb': 'ы',
        '\xfc': 'ь', '\xfd': 'э', '\xfe': 'ю', '\xff': 'я'
    }

    result = []
    for char in text:
        if ord(char) < 128:  # ASCII
            result.append(char)
        elif '\u0400' <= char <= '\u04FF':  # Уже кириллица
            result.append(char)
        else:
            result.append(char_map.get(char, char))
    return ''.join(result)

def main():
    pdf_path = '/home/atuzov/IdeaProjects/bronepehota-2/docs/original/bp_all_armsheets.pdf'

    # Извлекаем текст
    result = subprocess.run(
        ['pdftotext', '-layout', pdf_path, '-'],
        capture_output=True
    )
    raw_text = result.stdout.decode('utf-8')

    # Исправляем кодировку
    fixed_text = fix_encoding(raw_text)

    # Сохраняем результат
    with open('/tmp/fixed_text.txt', 'w', encoding='utf-8') as f:
        f.write(fixed_text)

    print("=== Исправленный текст ===")
    print(fixed_text[:10000])

if __name__ == '__main__':
    main()
