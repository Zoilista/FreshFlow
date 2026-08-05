import os
import re

directories = ['app', 'components']
replacements = [
    (re.compile(r"import Link from 'next/link';?"), r"import { Link } from '@/i18n/routing';"),
    (re.compile(r"import \{ usePathname \} from 'next/navigation';?"), r"import { usePathname } from '@/i18n/routing';"),
    (re.compile(r"import \{ usePathname, useRouter \} from 'next/navigation';?"), r"import { usePathname, useRouter } from '@/i18n/routing';"),
    (re.compile(r"import \{ useRouter \} from 'next/navigation';?"), r"import { useRouter } from '@/i18n/routing';"),
]

for directory in directories:
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content
                for pattern, repl in replacements:
                    new_content = pattern.sub(repl, new_content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f'Updated {filepath}')
