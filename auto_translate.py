import json
import os
import re
from pathlib import Path
from deep_translator import GoogleTranslator
import time

base_dir = Path(r"e:\FreshFlow\freshflow\messages")
en_dir = base_dir / "en"

target_langs = ["tr", "de", "fr", "es", "it", "nl", "pl", "pt"]
skip_files = ["dashboard.json", "landing.json"]

def process_value(val, translator, max_retries=3):
    if isinstance(val, dict):
        return {k: process_value(v, translator) for k, v in val.items()}
    elif isinstance(val, str):
        if not val.strip():
            return val
            
        variables = re.findall(r'\{[a-zA-Z0-9_]+\}', val)
        placeholders = {}
        temp_val = val
        for i, var in enumerate(variables):
            placeholder = f"__VAR{i}__"
            placeholders[placeholder] = var
            temp_val = temp_val.replace(var, placeholder)
            
        temp_val = temp_val.replace('<strong>', '__ST__').replace('</strong>', '__EN__')
        
        translated = None
        for attempt in range(max_retries):
            try:
                res = translator.translate(temp_val)
                if res:
                    translated = res
                    break
            except Exception as e:
                print(f"Translation failed: {e}")
            time.sleep(1)
            
        if not translated:
            translated = temp_val
            
        for ph, var in placeholders.items():
            translated = translated.replace(ph, var)
        translated = translated.replace('__ST__', '<strong>').replace('__EN__', '</strong>')
        return translated
    else:
        return val

for lang in target_langs:
    lang_dir = base_dir / lang
    lang_dir.mkdir(exist_ok=True)
    
    translator = GoogleTranslator(source='en', target=lang)
    
    for filename in os.listdir(en_dir):
        if not filename.endswith('.json') or filename in skip_files:
            continue
            
        en_file = en_dir / filename
        out_file = lang_dir / filename
        
        with open(en_file, "r", encoding="utf-8") as f:
            en_data = json.load(f)
            
        print(f"Translating {filename} to {lang}...")
        translated_data = process_value(en_data, translator)
        
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(translated_data, f, ensure_ascii=False, indent=2)

print("All translations complete.")
