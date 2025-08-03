
import os
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from bs4 import BeautifulSoup

def extract_text_from_xml(xml_path):
    """Extract text content from XML file, removing all HTML tags."""
    try:
        with open(xml_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Extract title
        title_match = re.search(r'<title>(.*?)</title>', content, re.DOTALL)
        title = title_match.group(1) if title_match else "No Title"
        
        # Extract body content
        soup = BeautifulSoup(content, 'html.parser')
        body_div = soup.find('div', class_='p-novel__body')
        
        if not body_div:
            return f"{title}\n\nError: Could not find novel body content."
        
        # Extract all text from paragraphs
        paragraphs = []
        for p in body_div.find_all('p'):
            text = p.get_text()
            if text.strip():  # Only add non-empty paragraphs
                paragraphs.append(text)
        
        # Combine title and paragraphs
        full_text = f"{title}\n\n" + "\n".join(paragraphs)
        return full_text
    
    except Exception as e:
        return f"Error processing {xml_path}: {str(e)}"

def main():
    # Create txt directory if it doesn't exist
    Path("txt").mkdir(exist_ok=True)
    
    # Process all XML files in orig directory
    for novel_dir in Path("orig").iterdir():
        if novel_dir.is_dir():
            # Create corresponding directory in txt
            output_dir = Path("txt") / novel_dir.name
            output_dir.mkdir(exist_ok=True, parents=True)
            
            # Process each XML file in the novel directory
            for xml_file in novel_dir.glob("*.xml"):
                # Create output file path
                output_file = output_dir / f"{xml_file.stem}.txt"
                
                # Skip if output file already exists
                if output_file.exists():
                    print(f"Skipping: {output_file} (already exists)")
                    continue
                
                # Extract text
                text_content = extract_text_from_xml(xml_file)
                
                # Write text to output file
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(text_content)
                
                print(f"Processed: {xml_file} → {output_file}")

if __name__ == "__main__":
    main()
    print("Text extraction complete!")

