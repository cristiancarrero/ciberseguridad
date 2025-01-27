from transformers import pipeline
import requests
from bs4 import BeautifulSoup
from typing import Tuple, List, Dict
import os
from sentence_transformers import SentenceTransformer
import torch
import re
from urllib.parse import quote
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

class SecurityChatBot:
    def __init__(self):
        # Inicializamos el modelo de HuggingFace especializado en texto técnico
        self.generator = pipeline('text-generation', 
                                model='bigscience/bloomz-560m',  # Modelo inicial
                                device=-1)
        
        # Modelo para embeddings
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Fuentes de información de seguridad
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
        
    def process_query(self, question: str, context: str = None) -> Tuple[str, List[str]]:
        """
        Procesa consultas relacionadas con seguridad en la nube y pentesting
        """
        try:
            # 1. Clasificar el tipo de consulta
            query_type = self._classify_query(question)
            
            # 2. Buscar en fuentes especializadas
            security_info = self._search_security_sources(question, query_type)
            
            # 3. Buscar soluciones específicas si es un error
            if self._is_error_query(question):
                error_solutions = self._search_error_solutions(question)
                security_info['answer'] += '\n\n' + error_solutions['answer']
                security_info['sources'].extend(error_solutions['sources'])
            
            # 4. Generar respuesta contextualizada
            prompt = self._create_security_prompt(question, security_info)
            response = self.generator(prompt, 
                                   max_length=300,
                                   num_return_sequences=1,
                                   temperature=0.7)
            
            return response[0]['generated_text'], security_info['sources']
            
        except Exception as e:
            return f"Lo siento, ocurrió un error: {str(e)}", []
    
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
        prompt = f"""Como experto en seguridad informática, cibersguridad y pentesting, responde a la siguiente consulta:

Pregunta: {question}

Contexto técnico: {security_info['answer']}

Proporciona una respuesta detallada y técnicamente precisa, incluyendo:
1. Explicación del problema o concepto
2. Mejores prácticas de seguridad relacionadas
3. Posibles soluciones o recomendaciones
4. Referencias a herramientas relevantes si aplica

Respuesta:"""
        return prompt
