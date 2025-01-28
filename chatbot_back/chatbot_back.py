from openai import AzureOpenAI
import os
from typing import Tuple, List, Dict
import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import quote
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class SecurityChatBot:
    '''
    Clase para crear un chatbot de seguridad informática
    '''
    def __init__(self):
        # Inicializar cliente de Azure OpenAI
        self.client = AzureOpenAI(
            api_key=os.getenv("AZURE_OPENAI_KEY"),
            api_version="2024-02-15-preview",
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
        )
        
        # Añadir fuentes de información de seguridad
        self.security_sources = {
            'pentesting': [
                'https://www.hackerone.com',
                'https://portswigger.net',
                'https://owasp.org'
            ],
            'cloud_security': [
                'https://aws.amazon.com/security/',
                'https://docs.microsoft.com/azure/security/',
                'https://cloud.google.com/security'
            ],
            'saas_security': [
                'https://www.cisa.gov/saas-security',
                'https://www.sans.org'
            ]
        }
        
        # Mejorar el prompt del sistema
        self.system_prompt = """Eres un asistente experto en seguridad informática, AWS y tecnología.
Responde de manera clara, concisa y en el mismo idioma de la pregunta.
Si la pregunta es sobre AWS, proporciona pasos específicos y ejemplos prácticos.
Si no entiendes la pregunta o necesitas más información, pídela amablemente."""

    def process_query(self, question: str, context: str = None) -> Tuple[str, List[str]]:
        try:
            messages = [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": question}
            ]
            
            if context:
                messages.insert(1, {"role": "assistant", "content": context})
            
            response = self.client.chat.completions.create(
                model=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
                messages=messages,
                temperature=0.7,
                max_tokens=800,
                top_p=0.95,
                frequency_penalty=0,
                presence_penalty=0
            )
            
            answer = response.choices[0].message.content
            sources = self._get_relevant_sources(question)
            
            return answer, sources
            
        except Exception as e:
            print(f"Error en process_query: {str(e)}")
            return "Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta de nuevo.", []
    
    def _classify_query(self, question: str) -> str:
        """
        Clasifica la consulta en diferentes categorías de seguridad
        """
        keywords = {
            'pentesting': ['pentest', 'vulnerabilidad', 'exploit', 'inyección', 'xss', 'sql injection'],
            'cloud_security': ['aws', 'azure', 'gcp', 'nube', 'cloud', 's3', 'ec2'],
            'saas_security': ['saas', 'software as a service', 'oauth', 'api security']
        }
        
        question_lower = question.lower()
        for category, terms in keywords.items():
            if any(term in question_lower for term in terms):
                return category
        return 'general_security'
    
    def _search_security_sources(self, question: str, query_type: str) -> Dict:
        """
        Busca información en fuentes especializadas de seguridad
        """
        try:
            sources = self.security_sources.get(query_type, self.security_sources['pentesting'])
            combined_info = {"answer": "", "sources": []}
            
            for source in sources[:2]:  # Limitamos a 2 fuentes para optimizar tiempo
                response = requests.get(source)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    # Buscar contenido relevante
                    relevant_content = self._extract_relevant_content(soup, question)
                    if relevant_content:
                        combined_info["answer"] += f"\n{relevant_content}"
                        combined_info["sources"].append(source)
            
            return combined_info
            
        except Exception as e:
            print(f"Error en búsqueda de seguridad: {e}")
            return {"answer": "", "sources": []}
    
    def _is_error_query(self, question: str) -> bool:
        """
        Determina si la consulta es sobre un error específico
        """
        error_patterns = [
            r'error[: ]',
            r'exception',
            r'failed',
            r'no funciona',
            r'problema con',
            r'how to fix',
            r'cómo resolver'
        ]
        return any(re.search(pattern, question.lower()) for pattern in error_patterns)
    
    def _search_error_solutions(self, question: str) -> Dict:
        """
        Busca soluciones específicas para errores en Stack Overflow y GitHub Issues
        """
        try:
            # Buscar en Stack Overflow
            so_query = quote(f"site:stackoverflow.com {question}")
            github_query = quote(f"site:github.com {question} issue")
            
            sources = [
                f"https://www.google.com/search?q={so_query}",
                f"https://www.google.com/search?q={github_query}"
            ]
            
            solutions = {"answer": "", "sources": []}
            
            for source in sources:
                response = requests.get(source, headers={'User-Agent': 'Mozilla/5.0'})
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    solution = self._extract_relevant_content(soup, question)
                    if solution:
                        solutions["answer"] += f"\nPosible solución encontrada: {solution}"
                        solutions["sources"].append(source)
            
            return solutions
            
        except Exception as e:
            print(f"Error buscando soluciones: {e}")
            return {"answer": "", "sources": []}
    
    def _extract_relevant_content(self, soup: BeautifulSoup, question: str) -> str:
        """
        Extrae contenido relevante del HTML basado en la pregunta
        """
        # Buscar en párrafos, títulos y bloques de código
        relevant_tags = soup.find_all(['p', 'h1', 'h2', 'h3', 'code'])
        relevant_content = []
        
        for tag in relevant_tags:
            text = tag.get_text().strip()
            if text and len(text) > 50:  # Filtrar contenido muy corto
                relevant_content.append(text)
        
        return '\n'.join(relevant_content[:2])  # Limitar a los 2 fragmentos más relevantes
    
    def _create_security_prompt(self, question: str, security_info: Dict) -> str:
        """
        Crea un prompt especializado en seguridad
        """
        prompt = f"""Como experto en seguridad informática, responde a la siguiente pregunta de manera clara y concisa:

Pregunta: {question}

Contexto: {security_info['answer']}

Respuesta:"""
        return prompt

    def _format_response(self, text: str) -> str:
        """
        Formatea la respuesta para que sea más limpia y directa
        """
        try:
            # Obtener solo la parte de la respuesta del asistente
            if '<|assistant|>' in text:
                response = text.split('<|assistant|>')[-1]
            else:
                response = text
            
            # Limpiar todos los tokens especiales y marcadores
            response = re.sub(r'<\|.*?\|>', '', response)
            response = re.sub(r'</s>', '', response)
            response = re.sub(r'<\|user\|>.*?<\|assistant\|>', '', response, flags=re.DOTALL)
            response = re.sub(r'<\|system\|>.*?</s>', '', response, flags=re.DOTALL)
            
            # Limpiar espacios extra y líneas en blanco
            response = ' '.join(response.split())
            
            return response.strip()
        except Exception as e:
            print(f"Error en format_response: {str(e)}")
            return "Lo siento, hubo un error al procesar la respuesta."

    def _get_relevant_sources(self, question: str) -> List[str]:
        """
        Obtiene fuentes relevantes basadas en la pregunta
        """
        query_type = self._classify_query(question)
        security_info = self._search_security_sources(question, query_type)
        return security_info['sources']
