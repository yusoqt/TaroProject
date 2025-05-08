"""
Text utility functions for processing text input and output.
"""

def remove_special_characters(text):
    """
    Remove or replace potentially problematic characters from text
    to ensure safe processing by the API.

    Args:
        text (str): The input text to clean

    Returns:
        str: The cleaned text
    """
    if not text:
        return ""

    # Replace common problematic characters
    replacements = {
        # Control characters and zero-width characters
        '\u200b': '',  # zero width space
        '\u200c': '',  # zero width non-joiner
        '\u200d': '',  # zero width joiner
        '\u200e': '',  # left-to-right mark
        '\u200f': '',  # right-to-left mark
        '\u2028': ' ', # line separator
        '\u2029': ' ', # paragraph separator

        # Other potentially problematic characters
        '�': '',       # replacement character

        # Remove model tokens that might appear in the text
        '<|im_start|>': '', # Remove model tokens that might appear in Thai text
        '<|im_end|>': '',   # Remove model tokens that might appear in Thai text
        '<|im_sep|>': '',   # Remove model separator tokens

        # Additional model tokens and control characters
        '<|endoftext|>': '',
        '\ufffd': '',      # Unicode replacement character
        '\u0000': '',      # Null character
        '\u001f': '',      # Unit separator
    }

    original_text = text

    for char, replacement in replacements.items():
        if char in text:
            text = text.replace(char, replacement)

    # Fix specific Thai error message if present
    if "ขออ<|im_start|> ไม่สามารถเชื่อมต่อกับหมอดูได้ในขณะ<|im_start|>้ โปรดลองใหม่<|im_start|>ครั้งในภาย<|im_start|>" in text:
        text = text.replace(
            "ขออ<|im_start|> ไม่สามารถเชื่อมต่อกับหมอดูได้ในขณะ<|im_start|>้ โปรดลองใหม่<|im_start|>ครั้งในภาย<|im_start|>",
            "ขออภัย ไม่สามารถเชื่อมต่อกับหมอดูได้ในขณะนี้ โปรดลองใหม่อีกครั้งในภายหลัง"
        )

    if original_text != text:
        print("Special characters were removed from the response")

    return text
