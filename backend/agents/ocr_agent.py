import pytesseract
from PIL import Image
import re

# Update path if needed
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract\tesseract.exe"


def extract_text_from_image(file_path: str) -> str:
    img = Image.open(file_path)
    text = pytesseract.image_to_string(img)
    return text


def extract_income(text: str):
    text = text.lower().replace(",", "").replace("₹", "").replace("rs.", "")

    patterns = [
        r"net\s*pay\s*[:\-]?\s*(\d{4,7})",
        r"gross\s*salary\s*[:\-]?\s*(\d{4,7})",
        r"total\s*earnings\s*[:\-]?\s*(\d{4,7})",
        r"salary\s*[:\-]?\s*(\d{4,7})",
        r"credited\s*[:\-]?\s*(\d{4,7})"
    ]

    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            income = int(match.group(1))
            if 5000 <= income <= 500000:
                return income

    return None
