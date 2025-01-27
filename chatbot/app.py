from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn
from chatbot_back import SecurityChatBot

app = FastAPI(title="Chatbot RAG con Web Scraping")

class Query(BaseModel):
    question: str
    context: Optional[str] = None

class Response(BaseModel):
    answer: str
    sources: list = []

chatbot = SecurityChatBot()

@app.post("/api/chat", response_model=Response)
async def chat_endpoint(query: Query):
    try:
        answer, sources = chatbot.process_query(query.question, query.context)
        return Response(answer=answer, sources=sources)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
