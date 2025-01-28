from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn
from chatbot_back import SecurityChatBot
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from contextlib import asynccontextmanager
from concurrent.futures import ThreadPoolExecutor

# Crear un executor global para manejar las tareas pesadas
executor = ThreadPoolExecutor(max_workers=3)

# Variable global para el chatbot
chatbot = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global chatbot
    try:
        # Inicialización
        print("Iniciando chatbot...")
        chatbot = SecurityChatBot()
        yield
    finally:
        # Limpieza
        print("Limpiando recursos...")
        if chatbot:
            if hasattr(chatbot.generator, 'model'):
                del chatbot.generator.model
            if hasattr(chatbot, 'embedding_model'):
                del chatbot.embedding_model
        if executor:
            executor.shutdown(wait=False)

app = FastAPI(
    title="Chatbot RAG con Web Scraping",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    question: str
    context: Optional[str] = None

class Response(BaseModel):
    answer: str
    sources: list = []

@app.post("/api/chat", response_model=Response)
async def chat_endpoint(query: Query):
    global chatbot
    if not chatbot:
        try:
            # Intentar reinicializar el chatbot si no existe
            chatbot = SecurityChatBot()
        except Exception as e:
            print(f"Error inicializando chatbot: {str(e)}")
            raise HTTPException(
                status_code=503, 
                detail="Servicio no disponible. Por favor, intenta más tarde."
            )
    
    try:
        answer, sources = await asyncio.get_event_loop().run_in_executor(
            executor,
            chatbot.process_query,
            query.question,
            query.context
        )
        
        if not answer or answer.isspace():
            raise HTTPException(
                status_code=500,
                detail="No se pudo generar una respuesta válida"
            )
            
        return Response(answer=answer, sources=sources)
        
    except Exception as e:
        print(f"Error en chat_endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "chatbot_initialized": chatbot is not None}

if __name__ == "__main__":
    config = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=8000,
        workers=1
    )
    server = uvicorn.Server(config)
    server.run()
