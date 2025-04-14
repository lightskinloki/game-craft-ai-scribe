
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json
import re

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

def extract_json_from_text(text):
    """Extract JSON from text that might have markdown code blocks or other formatting."""
    # Try to find JSON within ```json blocks
    json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass
    
    # Try to extract just the JSON part
    try:
        # Find potential JSON objects (starting with { and ending with })
        json_pattern = r'(\{[\s\S]*\})'
        matches = re.findall(json_pattern, text)
        for match in matches:
            try:
                return json.loads(match)
            except json.JSONDecodeError:
                continue
    except:
        pass
    
    return None

@app.route('/generate', methods=['POST'])
def generate_code():
    try:
        # Get the prompt and existing code from the request
        data = request.json
        if not data or 'prompt' not in data:
            return jsonify({"error": "No prompt provided"}), 400
        
        user_prompt = data['prompt']
        existing_code = data.get('existingCode', '')
        
        print(f"Received prompt: {user_prompt[:100]}...")
        print(f"Existing code length: {len(existing_code)}")
        
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
        
        Focus on explaining concepts, providing code snippets that the user can integrate,
        and helping them understand how to implement the requested changes.
        
        Your response MUST be a JSON object with these keys:
        - explanation: A detailed explanation of the code changes needed, the concepts, and code snippets if relevant
        
        The explanation should contain any relevant code snippets that would need to be added or modified in the main game code.
        Make sure your response is valid JSON.
        """
        
        # Generate content from Gemini
        response = model.generate_content(structured_prompt)
        
        # Process the response
        response_text = response.text
        print(f"Raw response from AI (first 200 chars): {response_text[:200]}...")
        
        # Try to parse the response as JSON
        result = None
        
        # First try direct JSON parsing
        try:
            result = json.loads(response_text)
            print("Successfully parsed JSON directly")
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            # Try to extract JSON from text that might have markdown formatting
            result = extract_json_from_text(response_text)
            if result:
                print("Successfully extracted JSON from text")
        
        # If we successfully parsed JSON and it has the expected structure
        if result and isinstance(result, dict) and 'explanation' in result:
            print(f"Returning explanation from JSON, length: {len(result['explanation'])}")
            return jsonify({
                "explanation": result['explanation']
            })
        
        # Fallback: Just return the full response as explanation
        print("Using fallback: returning full text as explanation")
        return jsonify({
            "explanation": response_text
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": f"Failed to generate explanation: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
