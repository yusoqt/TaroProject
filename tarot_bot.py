"""
Tarot Reading Bot using Google Gemini API

This module provides functionality to generate tarot reading summaries
using the Google Gemini API. It takes information about the drawn tarot cards
and generates a mystical, fortune-teller style interpretation with detailed
tarot card meanings from a comprehensive database.
"""

import os
import json
import logging
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
    def __init__(self, model="gemini-2.0-flash"):
        """
        Initialize the tarot bot with Google Gemini API and load tarot card data

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

        # Load tarot card data
        self.tarot_data = self._load_tarot_data()

    def _load_tarot_data(self):
        """
        Load tarot card data from JSON file

        Returns:
            dict: Dictionary of tarot card data indexed by card name
        """
        try:
            with open('newtarot.json', 'r', encoding='utf-8') as file:
                tarot_cards = json.load(file)

            # Create a dictionary indexed by card name for easy lookup
            tarot_dict = {}
            for card in tarot_cards:
                tarot_dict[card['name']] = card

            return tarot_dict
        except Exception as e:
            logger.error(f"Error loading tarot data: {e}")
            return {}

    def _get_card_meaning(self, card_name, is_reversed):
        """
        Get the meaning of a tarot card based on its orientation

        Args:
            card_name (str): The name of the tarot card
            is_reversed (bool): Whether the card is reversed

        Returns:
            str: The meaning of the card
        """
        if not self.tarot_data or card_name not in self.tarot_data:
            return "ไม่พบข้อมูลไพ่"

        card_data = self.tarot_data[card_name]

        if is_reversed:
            # Get reversed meaning
            if 'reversed_meanings' in card_data and 'general' in card_data['reversed_meanings']:
                return card_data['reversed_meanings']['general']
            elif 'keywords' in card_data and 'reversed' in card_data['keywords']:
                return card_data['keywords']['reversed']
        else:
            # Get upright meaning
            if 'upright_meanings' in card_data and 'general' in card_data['upright_meanings']:
                return card_data['upright_meanings']['general']
            elif 'keywords' in card_data and 'upright' in card_data['keywords']:
                return card_data['keywords']['upright']

        return "ไม่พบความหมายของไพ่"

    def generate_reading_summary(self, cards_data):
        """
        Generate a summary of the tarot reading based on the drawn cards

        Args:
            cards_data (list): List of dictionaries containing card information
                Each dict should have:
                - name: Card name
                - position: Position in the spread (e.g., "Present", "Challenge")
                - isReversed: Boolean indicating if card is reversed

        Returns:
            str: A mystical interpretation of the tarot reading
        """
        try:
            # Ensure we have enough cards for a reading
            if len(cards_data) < 3:
                return "สวัสดีค่ะคุณผู้ชม ดิฉันหมอดูพรพิมล ยินดีที่ได้อ่านไพ่ทาโร่ให้คุณในวันนี้ค่ะ\n\nหมอต้องการไพ่อย่างน้อย 3 ใบเพื่อทำนาย โปรดลองสุ่มไพ่ใหม่อีกครั้งนะคะ เพื่อที่หมอจะได้ดูดวงให้คุณได้อย่างแม่นยำค่ะ"

            # Enhance cards with detailed meanings from our database
            for card in cards_data:
                card_name = card.get('name')
                is_reversed = card.get('isReversed', False)

                # Add detailed meaning from our database
                card['meaning'] = self._get_card_meaning(card_name, is_reversed)

            # Create prompt with enhanced card data
            prompt = self._create_tarot_prompt(cards_data)

            # Generate content
            response = self.fortune_teller.generate_content(prompt)

            # Clean and return the response
            summary = remove_special_characters(response.text)
            return summary

        except ValueError:
            # Create a mystical error message without mentioning backend issues
            return "สวัสดีค่ะคุณผู้ชม ดิฉันหมอดูพรพิมล ยินดีที่ได้อ่านไพ่ทาโร่ให้คุณในวันนี้ค่ะ\n\nดวงดาวกำลังเคลื่อนตัวในตำแหน่งที่ไม่เอื้ออำนวยต่อการทำนาย หมอขอแนะนำให้คุณลองใหม่อีกครั้งในเวลาที่พลังจักรวาลเป็นใจนะคะ"

        except Exception:
            # Create a mystical error message without mentioning backend issues
            return "สวัสดีค่ะคุณผู้ชม ดิฉันหมอดูพรพิมล ยินดีที่ได้อ่านไพ่ทาโร่ให้คุณในวันนี้ค่ะ\n\nพลังงานจักรวาลกำลังแปรปรวน ทำให้หมอไม่สามารถเชื่อมต่อกับพลังแห่งไพ่ทาโร่ได้อย่างสมบูรณ์ หมอขอแนะนำให้คุณลองใหม่อีกครั้งในภายหลังนะคะ เมื่อดวงดาวเรียงตัวในตำแหน่งที่เหมาะสม"

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

        ห้ามพูดถึงเรื่องเบื้องหลังหรือ Backend หรือการรอข้อมูล หรือการประมวลผล ให้พูดเหมือนหมอดูจริงๆ ที่มีความรู้เรื่องไพ่ทาโร่อย่างลึกซึ้ง

        โปรดวิเคราะห์ไพ่ทาโร่ต่อไปนี้และให้คำทำนายโดยรวมที่เชื่อมโยงความหมายของไพ่ทั้งหมดเข้าด้วยกัน
        ใช้ภาษาไทยในการตอบและพยายามให้คำทำนายที่มีความหวังและเป็นประโยชน์ต่อผู้ถาม

        ไพ่ที่ถูกเปิดในการทำนายครั้งนี้:
        """

        for card in cards_data:
            card_status = "กลับหัว" if card.get("isReversed") else "หงายขึ้น"
            prompt += f"\n- ตำแหน่ง '{card.get('position')}': ไพ่ {card.get('name')} ({card_status})"
            prompt += f"\n  ความหมาย: {card.get('meaning')}"

            # Add keywords if available
            if card.get('name') in self.tarot_data:
                card_data = self.tarot_data[card.get('name')]
                if card.get("isReversed") and 'keywords' in card_data and 'reversed' in card_data['keywords']:
                    prompt += f"\n  คำสำคัญ: {card_data['keywords']['reversed']}"
                elif not card.get("isReversed") and 'keywords' in card_data and 'upright' in card_data['keywords']:
                    prompt += f"\n  คำสำคัญ: {card_data['keywords']['upright']}"

        prompt += """

        โปรดสรุปคำทำนายทั้งหมดในรูปแบบของหมอดูไทย โดยเชื่อมโยงความหมายของไพ่แต่ละใบเข้าด้วยกัน
        และให้คำแนะนำที่เป็นประโยชน์แก่ผู้ถาม ความยาวประมาณ 3-4 ย่อหน้า

        ห้ามพูดถึงเรื่องเบื้องหลังหรือ Backend หรือการรอข้อมูล หรือการประมวลผล ให้พูดเหมือนหมอดูจริงๆ ที่มีความรู้เรื่องไพ่ทาโร่อย่างลึกซึ้ง

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
        data = request.json
        cards_data = data.get('cards', [])

        if not cards_data:
            # Mystical error message for no cards
            return jsonify({
                "reading": "สวัสดีค่ะคุณผู้ชม ดิฉันหมอดูพรพิมล ยินดีที่ได้อ่านไพ่ทาโร่ให้คุณในวันนี้ค่ะ\n\nหมอต้องการไพ่เพื่อทำนาย โปรดกดปุ่มสุ่มไพ่เพื่อให้หมอได้ดูดวงให้คุณนะคะ"
            })

        # Initialize tarot bot with card data
        bot = TarotBot()
        reading = bot.generate_reading_summary(cards_data)

        return jsonify({"reading": reading})

    except ValueError:
        # Mystical error message without mentioning backend issues
        return jsonify({
            "reading": "สวัสดีค่ะคุณผู้ชม ดิฉันหมอดูพรพิมล ยินดีที่ได้อ่านไพ่ทาโร่ให้คุณในวันนี้ค่ะ\n\nดวงดาวกำลังเคลื่อนตัวในตำแหน่งที่ไม่เอื้ออำนวยต่อการทำนาย หมอขอแนะนำให้คุณลองใหม่อีกครั้งในเวลาที่พลังจักรวาลเป็นใจนะคะ"
        })
    except Exception:
        # Mystical error message without mentioning backend issues
        return jsonify({
            "reading": "สวัสดีค่ะคุณผู้ชม ดิฉันหมอดูพรพิมล ยินดีที่ได้อ่านไพ่ทาโร่ให้คุณในวันนี้ค่ะ\n\nพลังงานจักรวาลกำลังแปรปรวน ทำให้หมอไม่สามารถเชื่อมต่อกับพลังแห่งไพ่ทาโร่ได้อย่างสมบูรณ์ หมอขอแนะนำให้คุณลองใหม่อีกครั้งในภายหลังนะคะ เมื่อดวงดาวเรียงตัวในตำแหน่งที่เหมาะสม"
        })

# Run the Flask app if executed directly
if __name__ == "__main__":
    app.run(debug=True, port=5000)
