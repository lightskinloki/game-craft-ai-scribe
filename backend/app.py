
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
        
        User has the following game code already in their editor:
        ```javascript
        {existing_code}
        ```
        
        The user's request is: {user_prompt}
        
        Provide a detailed explanation of the changes needed including code examples. 
        DO NOT provide a full replacement of the code - only provide the explanation.
        
        Your response MUST be a JSON object with these keys:
        - explanation: A detailed explanation of the code changes needed, the concepts, and code snippets if relevant
        
        The explanation should contain any relevant code snippets that would need to be added or modified in the main game code.
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
            if 'explanation' in result:
                return jsonify({
                    "explanation": result['explanation']
                })
        except json.JSONDecodeError:
            # If Gemini didn't return valid JSON, we'll need to use the full response
            pass
        
        # Fallback: Just return the full response as explanation
        return jsonify({
            "explanation": response_text
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": f"Failed to generate explanation: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
