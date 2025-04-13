
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure the Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("No GEMINI_API_KEY found in environment variables")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-pro')

@app.route('/generate', methods=['POST'])
def generate_code():
    try:
        # Get the prompt and existing code from the request
        data = request.json
        if not data or 'prompt' not in data:
            return jsonify({"error": "No prompt provided"}), 400
        
        user_prompt = data['prompt']
        existing_code = data.get('existingCode', '')
        
        # Create a structured prompt for Gemini that asks for code and explanation
        structured_prompt = f"""
        You are an AI assistant specialized in game development.
        
        Generate game code based on this user request: {user_prompt}
        
        {f'Here is the existing code to modify or enhance: \n```\n{existing_code}\n```' if existing_code else ''}
        
        Your response MUST be a JSON object with these two keys:
        - code: The JavaScript/TypeScript game code implementation
        - explanation: A detailed explanation of the code, how it works, and key concepts
        
        The explanation should ONLY appear in the explanation field, NOT in the code field.
        Make sure your response is valid JSON.
        """
        
        # Generate content from Gemini
        response = model.generate_content(structured_prompt)
        
        # Process the response
        response_text = response.text
        
        # Try to parse the response as JSON
        try:
            # Handle case where Gemini returns properly formatted JSON
            result = json.loads(response_text)
            if 'code' in result and 'explanation' in result:
                return jsonify(result)
        except json.JSONDecodeError:
            # If Gemini didn't return valid JSON, we'll need to do some parsing
            pass
        
        # Fallback: Try to separate code and explanation manually
        # This is a simple heuristic and might need adjustment
        code_parts = []
        explanation_parts = []
        
        # Simple heuristic: code is typically within backticks or after "```" markers
        in_code_block = False
        lines = response_text.split('\n')
        
        for line in lines:
            if line.startswith('```') or line.strip() == '```':
                in_code_block = not in_code_block
                continue
                
            if in_code_block:
                code_parts.append(line)
            else:
                explanation_parts.append(line)
        
        code = '\n'.join(code_parts).strip()
        explanation = '\n'.join(explanation_parts).strip()
        
        # If we couldn't extract code properly, use the whole response as explanation
        if not code:
            explanation = response_text
            code = "// Gemini didn't generate structured code. Please see the explanation."
        
        return jsonify({
            "code": code,
            "explanation": explanation
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": f"Failed to generate code: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
