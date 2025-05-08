"""
Tarot Reading Bot using Google Gemini API

This module provides functionality to generate tarot reading summaries
using the Google Gemini API. It takes information about the drawn tarot cards
and generates a mystical, fortune-teller style interpretation.
"""

import os
import json
import logging
import traceback
import google.generativeai as genai
from dotenv import load_dotenv
from text_utils import remove_special_characters
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('tarot_bot')

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

class TarotBot:
    def __init__(self, model="gemini-1.5-flash"):
        """
        Initialize the tarot bot with Google Gemini API

        Args:
            model (str): The Gemini model to use
                Default is "gemini-1.5-flash" (stable model with good balance of speed and quality)
                Other options include:
                - "gemini-1.5-pro" (more powerful but slower)
                - "gemini-2.0-flash" (newer model with improved capabilities)
        """
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")

        genai.configure(api_key=self.api_key)
        self.model = model

        # Initialize the model with fortune teller persona
        self.fortune_teller = genai.GenerativeModel(self.model)

    def generate_reading_summary(self, cards_data):
        """
        Generate a summary of the tarot reading based on the drawn cards

        Args:
            cards_data (list): List of dictionaries containing card information
                Each dict should have:
                - name: Card name
                - position: Position in the spread (e.g., "Present", "Challenge")
                - isReversed: Boolean indicating if card is reversed
                - meaning: The meaning of the card in this position (optional)

        Returns:
            str: A mystical interpretation of the tarot reading
        """
        try:
            logger.info(f"Received {len(cards_data)} cards for reading")
            for i, card in enumerate(cards_data):
                logger.info(f"Card {i+1}: {card.get('name')} at position {card.get('position')}, reversed: {card.get('isReversed')}")

            if len(cards_data) < 3:
                logger.warning("Not enough cards provided for reading")
                return "ขออภัยค่ะ หมอต้องการไพ่อย่างน้อย 3 ใบเพื่อทำนาย โปรดลองสุ่มไพ่ใหม่อีกครั้ง"

            prompt = self._create_tarot_prompt(cards_data)
            logger.debug("Created prompt for Gemini API")

            logger.info("Sending request to Gemini API")
            response = self.fortune_teller.generate_content(prompt)
            logger.info("Received response from Gemini API")

            summary = remove_special_characters(response.text)
            logger.debug("Cleaned response text of special characters")
            return summary

        except ValueError as e:
            # Handle specific value errors (like API key issues)
            logger.error(f"Value error in tarot reading generation: {e}")
            traceback.print_exc()
            if "API key" in str(e):
                return "ขออภัยค่ะ หมอดูไม่สามารถใช้พลังได้ในขณะนี้ โปรดตรวจสอบว่าได้ตั้งค่า API key ถูกต้องแล้ว"
            return "ขออภัยค่ะ เกิดข้อผิดพลาดในการอ่านไพ่ โปรดลองใหม่อีกครั้ง"

        except Exception as e:
            # Handle general exceptions
            logger.error(f"Error generating tarot reading: {e}")
            traceback.print_exc()
            return "ขออภัยค่ะ หมอไม่สามารถอ่านไพ่ได้ในขณะนี้ พลังงานจักรวาลอาจถูกรบกวน โปรดลองใหม่อีกครั้งในภายหลัง หรือตรวจสอบว่าได้ตั้งค่า API key ถูกต้องแล้ว"

    def _create_tarot_prompt(self, cards_data):
        """
        Create a detailed prompt for the Gemini model based on the tarot cards

        Args:
            cards_data (list): List of dictionaries containing card information

        Returns:
            str: A formatted prompt for the Gemini model
        """
        prompt = """
        คุณคือหมอดูไพ่ทาโร่ที่มีประสบการณ์สูง พูดจาด้วยน้ำเสียงลึกลับ มีความรู้เรื่องโหราศาสตร์และไพ่ทาโร่อย่างลึกซึ้ง
        ใช้คำพูดแบบหมอดูไทย เช่น "ดวงของคุณ..." "ไพ่บ่งบอกว่า..." "พลังงานที่ส่งมา..." "ดวงดาวกำลังบอกว่า..."

        โปรดวิเคราะห์ไพ่ทาโร่ต่อไปนี้และให้คำทำนายโดยรวมที่เชื่อมโยงความหมายของไพ่ทั้งหมดเข้าด้วยกัน
        ใช้ภาษาไทยในการตอบและพยายามให้คำทำนายที่มีความหวังและเป็นประโยชน์ต่อผู้ถาม

        ไพ่ที่ถูกเปิดในการทำนายครั้งนี้:
        """

        for card in cards_data:
            card_status = "กลับหัว" if card.get("isReversed") else "หงายขึ้น"
            prompt += f"\n- ตำแหน่ง '{card.get('position')}': ไพ่ {card.get('name')} ({card_status})"
            prompt += f"\n  ความหมาย: {card.get('meaning')}"

        prompt += """

        โปรดสรุปคำทำนายทั้งหมดในรูปแบบของหมอดูไทย โดยเชื่อมโยงความหมายของไพ่แต่ละใบเข้าด้วยกัน
        และให้คำแนะนำที่เป็นประโยชน์แก่ผู้ถาม ความยาวประมาณ 3-4 ย่อหน้า

        เริ่มต้นด้วยคำทักทายแบบหมอดู และจบด้วยคำแนะนำหรือกำลังใจ
        """

        return prompt

# Health check endpoint
@app.route('/api/tarot-reading', methods=['HEAD'])
def health_check():
    """
    Simple health check endpoint to verify the server is running
    Returns a 200 OK response with no content
    """
    return "", 200

# API endpoint for tarot reading
@app.route('/api/tarot-reading', methods=['POST'])
def tarot_reading():
    try:
        logger.info("Received tarot reading request")
        data = request.json
        cards_data = data.get('cards', [])

        if not cards_data:
            logger.warning("Request received with no card data")
            return jsonify({"error": "No card data provided"}), 400

        logger.info(f"Initializing tarot bot with {len(cards_data)} cards")
        bot = TarotBot()

        reading = bot.generate_reading_summary(cards_data)
        logger.info("Successfully generated tarot reading")

        return jsonify({"reading": reading})

    except ValueError as e:
        logger.error(f"Value error in API endpoint: {e}")
        if "GEMINI_API_KEY environment variable not set" in str(e):
            return jsonify({"error": "API key ไม่ถูกตั้งค่า โปรดตรวจสอบไฟล์ .env ของคุณ"}), 500
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        logger.error(f"API error: {e}")
        traceback.print_exc()

        # Provide a more specific error message based on the exception type
        if "Connection" in str(e):
            logger.error("Connection error detected")
            return jsonify({"error": "ไม่สามารถเชื่อมต่อกับ API ได้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต"}), 500
        elif "Timeout" in str(e):
            logger.error("Timeout error detected")
            return jsonify({"error": "การเชื่อมต่อกับหมอดูหมดเวลา โปรดลองใหม่อีกครั้ง"}), 500
        else:
            logger.error(f"Unspecified error: {str(e)}")
            return jsonify({"error": "ขออภัย ไม่สามารถเชื่อมต่อกับหมอดูได้ในขณะนี้ โปรดลองใหม่อีกครั้งในภายหลัง"}), 500

# Run the Flask app if executed directly
if __name__ == "__main__":
    app.run(debug=True, port=5000)
