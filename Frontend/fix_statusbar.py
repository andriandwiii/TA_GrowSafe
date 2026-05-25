import os

directory = r'd:\SEMESTER 6\TA\Growsafe\Frontend\app'

target = '<StatusBar barStyle="dark-content" backgroundColor="#F4F7FB" />'
replacement = '<StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />'

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            if target in content:
                content = content.replace(target, replacement)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {filepath}")
