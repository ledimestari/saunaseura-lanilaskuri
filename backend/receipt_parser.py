import sys
import argparse
import re
import pytesseract
from PIL import Image
from pdf2image import convert_from_path
import uuid

# Converts a PDF file to images (handles multi-page PDFs).
def pdf_to_images(pdf_path, dpi=300):
    images = convert_from_path(pdf_path, dpi=dpi)
    return images


# Parses the itemized part of a grocery store receipt, extracting only items with a final price. Returns a list of tuples (item, price).
def parse_receipt_items(receipt_text):
    items = []

    # Regex to parse only the items and their prices
    pattern = re.compile(
        r"^(?!.*(?:YHTEENSA|PLUSSA|Viite|KERRYTTAVAT|Ruokaostokset|Kayttotavaraostokset|Asiakaspalvelu|P\. \d{3} \d{3} \d{4}|Bonustapahtuma))"  # Exclude specific keywords and phone/transaction numbers
        r"(.*[a-zA-Z]+.*?)\s([\d,]+)$",  # Product name must contain letters and end with a price
        re.MULTILINE
    )

    for match in pattern.finditer(receipt_text):
        product_name = match.group(1).strip()
        price = match.group(2).replace(",", ".").strip()

        items.append({"item": product_name, "price": price, "payers": [], "id": str(uuid.uuid4())})

    return items


def handle_receipt(filepath: str):
    # Validate file format
    if not filepath.lower().endswith(('.png', '.jpg', '.jpeg', '.pdf')):
        print("Wrong file format provided. Make sure it's one of the following: (jpg, jpeg, png, pdf).")
        return [None]

    try:
        if filepath.lower().endswith('.pdf'):
            images = pdf_to_images(filepath)
            # Extract text from each page
            text = ""
            for i, image in enumerate(images):
                print(f"Processing page {i + 1}...")
                text += pytesseract.image_to_string(image) + "\n\n"
        else:
            image = Image.open(filepath)
            text = pytesseract.image_to_string(image)

        parsed_items = parse_receipt_items(text)

        for item in parsed_items:
            print(item)
        return parsed_items

    except Exception as e:
        print(f"An error occurred: {e}")
        return [None]
