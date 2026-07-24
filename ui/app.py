import sys
import os
import json
import time
from flask import Flask, render_template, request, Response, stream_with_context
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent directory to path so we can import template.py
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import template as backend

app = Flask(__name__)

# Basic history storage for demo purposes
chat_history = []
total_turns = 0
total_tokens = 0
total_cost = 0.0

@app.route("/")
def index():
    return render_template("index.html", 
                           model_large=backend.OPENAI_MODEL, 
                           model_mini=backend.OPENAI_MINI_MODEL)

@app.route("/chat", methods=["POST"])
def chat():
    global chat_history, total_turns, total_tokens, total_cost
    
    data = request.json
    user_msg = data.get("message", "")
    persona = data.get("persona", "Bạn là trợ lý thân thiện, trả lời ngắn gọn bằng tiếng Việt.")
    selected_model = data.get("model", backend.OPENAI_MODEL)
    
    if not user_msg:
        return {"error": "Message is required"}, 400

    def generate():
        global chat_history, total_turns, total_tokens, total_cost
        
        # Prepare messages for API
        messages = [{"role": "system", "content": persona}] + chat_history + [{"role": "user", "content": user_msg}]
        
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=backend.OPENAI_BASE_URL)
        
        try:
            # Stream the response
            stream = backend.retry_with_backoff(
                lambda: client.chat.completions.create(
                    model=selected_model, 
                    messages=messages, 
                    stream=True
                )
            )
            
            reply = ""
            for chunk in stream:
                delta = chunk.choices[0].delta.content or ""
                reply += delta
                # Send SSE data event for chunk
                yield f"data: {json.dumps({'type': 'chunk', 'content': delta})}\n\n"
            
            # Update history and stats after stream finishes
            chat_history.append({"role": "user", "content": user_msg})
            chat_history.append({"role": "assistant", "content": reply})
            chat_history = chat_history[-8:]  # Keep last 4 turns
            
            total_turns += 1
            tokens = backend.count_tokens(user_msg, selected_model) + backend.count_tokens(reply, selected_model)
            total_tokens += tokens
            cost_stats = backend.estimate_cost(user_msg, reply, selected_model)
            total_cost += cost_stats["total_cost"]
            
            # Send final stats event
            stats = {
                "type": "stats",
                "turns": total_turns,
                "tokens": total_tokens,
                "cost": total_cost
            }
            yield f"data: {json.dumps(stats)}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return Response(stream_with_context(generate()), mimetype="text/event-stream")

if __name__ == "__main__":
    app.run(debug=True, port=5000)