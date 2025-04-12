
# GameCraft AI Backend

This is a simple Flask backend that communicates between the React frontend and Google's Gemini API for game code generation.

## Setup

1. Create a Python virtual environment (recommended):
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file:
   - Copy the `.env.example` file to `.env`
   - Add your Gemini API key to the `.env` file

## Running the Server

Start the Flask server:
```
python app.py
```

The server will run on http://localhost:5000 by default.

## API Endpoints

### POST /generate

Generates game code based on a prompt.

**Request Body:**
```json
{
  "prompt": "Create a simple player movement script"
}
```

**Response:**
```json
{
  "code": "// Generated code will appear here",
  "explanation": "Explanation will appear here"
}
```

## Troubleshooting

- Make sure the Gemini API key is valid
- Check the console for any error messages
- Ensure the frontend is sending requests to the correct endpoint
