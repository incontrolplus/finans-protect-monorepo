import os
for root, _, files in os.walk('website'):
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            import re
            content = re.sub(r'\?v=\d+\.\d+\.\d+', '?v=3.0.0', content)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
print('Bumped version to v=3.0.0')
