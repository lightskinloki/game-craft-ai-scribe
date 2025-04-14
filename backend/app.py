
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json
import re
import uuid
from werkzeug.utils import secure_filename

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

# Create directory for Phaser assets
PHASER_ASSETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "phaser_assets")
os.makedirs(PHASER_ASSETS_DIR, exist_ok=True)

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
        editor_mode = data.get('editorMode', 'general')
        
        print(f"Received prompt: {user_prompt[:100]}...")
        print(f"Existing code length: {len(existing_code)}")
        print(f"Editor mode: {editor_mode}")
        
        # Create a structured prompt for Gemini that asks for code and explanation
        structured_prompt = f"""
        You are an AI assistant specialized in game development.
        
        User has the following game code already in their editor:
        ```javascript
        {existing_code}
        ```
        
        The user's request is: {user_prompt}
        """
        
        # Add Phaser-specific context if in Phaser mode
        if editor_mode == 'phaser':
            structured_prompt += """
            The user is developing a Phaser 3 game. Keep your explanations and code examples specifically for Phaser 3.
            
            Assume assets are loaded via URLs like http://localhost:5000/assets/phaser/filename.png using standard Phaser methods like this.load.image('key', 'url').
            
            When providing code, use Phaser 3 best practices and patterns.
            """
        
        structured_prompt += """
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

@app.route('/upload/phaser', methods=['POST'])
def upload_phaser_assets():
    try:
        if 'files' not in request.files:
            return jsonify({"error": "No files part in the request"}), 400
        
        files = request.files.getlist('files')
        if not files or files[0].filename == '':
            return jsonify({"error": "No files selected"}), 400
        
        uploaded_files = []
        
        for file in files:
            if file:
                # Secure the filename and generate a unique name
                filename = secure_filename(file.filename)
                # Add unique identifier to avoid name collisions
                if '.' in filename:
                    name, ext = filename.rsplit('.', 1)
                    unique_filename = f"{name}_{str(uuid.uuid4())[:8]}.{ext}"
                else:
                    unique_filename = f"{filename}_{str(uuid.uuid4())[:8]}"
                
                # Save the file
                file_path = os.path.join(PHASER_ASSETS_DIR, unique_filename)
                file.save(file_path)
                
                # Get file metadata
                file_size = os.path.getsize(file_path)
                file_type = file.content_type
                
                uploaded_files.append({
                    "filename": unique_filename,
                    "originalName": filename,
                    "size": file_size,
                    "type": file_type
                })
        
        return jsonify({
            "message": f"Successfully uploaded {len(uploaded_files)} files",
            "files": uploaded_files
        })
    
    except Exception as e:
        print(f"Error uploading files: {str(e)}")
        return jsonify({"error": f"Failed to upload files: {str(e)}"}), 500

@app.route('/assets/phaser/<filename>', methods=['GET'])
def serve_phaser_asset(filename):
    try:
        return send_from_directory(PHASER_ASSETS_DIR, filename)
    except Exception as e:
        print(f"Error serving asset {filename}: {str(e)}")
        return jsonify({"error": f"Failed to serve asset: {str(e)}"}), 404

@app.route('/assets/phaser/<filename>', methods=['DELETE'])
def delete_phaser_asset(filename):
    try:
        file_path = os.path.join(PHASER_ASSETS_DIR, filename)
        if not os.path.exists(file_path):
            return jsonify({"error": "Asset not found"}), 404
        
        os.remove(file_path)
        return jsonify({"message": f"Asset {filename} deleted successfully"})
    except Exception as e:
        print(f"Error deleting asset {filename}: {str(e)}")
        return jsonify({"error": f"Failed to delete asset: {str(e)}"}), 500

@app.route('/assets/phaser', methods=['GET'])
def list_phaser_assets():
    try:
        files = []
        for filename in os.listdir(PHASER_ASSETS_DIR):
            file_path = os.path.join(PHASER_ASSETS_DIR, filename)
            if os.path.isfile(file_path):
                file_size = os.path.getsize(file_path)
                
                # Determine file type based on extension
                ext = os.path.splitext(filename)[1].lower()
                if ext in ['.png', '.jpg', '.jpeg', '.gif', '.webp']:
                    file_type = f"image/{ext[1:]}"
                elif ext in ['.mp3', '.ogg', '.wav']:
                    file_type = f"audio/{ext[1:]}"
                elif ext == '.json':
                    file_type = "application/json"
                else:
                    file_type = "application/octet-stream"
                
                files.append({
                    "id": str(uuid.uuid4()),
                    "name": filename,
                    "url": f"http://localhost:5000/assets/phaser/{filename}",
                    "size": file_size,
                    "type": file_type
                })
        
        return jsonify({
            "assets": files
        })
    except Exception as e:
        print(f"Error listing assets: {str(e)}")
        return jsonify({"error": f"Failed to list assets: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
