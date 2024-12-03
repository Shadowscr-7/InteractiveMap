import re
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.ensemble import RandomForestClassifier
import pandas as pd

# Normalización y preprocesamiento
def normalize_name(name):
    name = name.lower()
    name = re.sub(r'[^a-z0-9\s]', ' ', name)  # Reemplaza caracteres no alfanuméricos
    name = re.sub(r'\s+', ' ', name).strip()  # Elimina espacios múltiples
    return name

def replace_synonyms(name):
    synonyms = {
        'av': 'avenida',
        '18': 'dieciocho',
        'lib': 'libertador',
        '19': 'diecinueve',
    }
    for key, value in synonyms.items():
        name = re.sub(rf'\b{key}\b', value, name)  # Reemplazo exacto de palabras
    return name

def preprocess_name(name):
    name = normalize_name(name)
    name = replace_synonyms(name)
    return name

# Similaridad basada en distancia
def calculate_similarity(name1, name2):
    name1 = preprocess_name(name1)
    name2 = preprocess_name(name2)
    vectorizer = CountVectorizer().fit([name1, name2])
    vec1 = vectorizer.transform([name1])
    vec2 = vectorizer.transform([name2])
    return cosine_similarity(vec1, vec2)[0][0]

# Clasificación de similitud
def classify_similarity(name1, name2, threshold=0.85):
    name1 = preprocess_name(name1)
    name2 = preprocess_name(name2)
    similarity_score = calculate_similarity(name1, name2)

    if similarity_score == 1.0:
        return "Exactas"
    elif similarity_score >= threshold:
        return "Similares"
    else:
        return "Diferentes"
