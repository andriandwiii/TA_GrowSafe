import os
import re

directory = r'd:\SEMESTER 6\TA\Growsafe\Frontend\app'

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            if "import { SafeAreaView } from 'react-native-safe-area-context';" not in content and "SafeAreaView" in content:
                # Remove SafeAreaView from react-native imports
                content = re.sub(r'SafeAreaView,\s*', '', content)
                content = re.sub(r',\s*SafeAreaView', '', content)
                
                # Add import from react-native-safe-area-context after react-native import
                content = re.sub(
                    r"(from\s+'react-native';)", 
                    r"\1\nimport { SafeAreaView } from 'react-native-safe-area-context';", 
                    content
                )
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {filepath}")
