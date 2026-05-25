import os

filepath = r'd:\SEMESTER 6\TA\Growsafe\Frontend\app\(auth)\index.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

import re
content = re.sub(
    r'<StatusBar\s+barStyle="dark-content"\s+backgroundColor="#FFFFFF"\s*/>',
    r'<StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />',
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated auth index")
