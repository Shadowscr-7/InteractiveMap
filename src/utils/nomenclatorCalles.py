import re
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import pandas as pd

# Preprocesamiento de texto
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

# Modelo de aprendizaje supervisado
def train_model(data):
    data['name1'] = data['name1'].apply(preprocess_name)
    data['name2'] = data['name2'].apply(preprocess_name)
    vectorizer = CountVectorizer()
    
    # Crear representación vectorial de los pares de nombres concatenados
    X = vectorizer.fit_transform(data['name1'] + " " + data['name2'])
    y = data['similar']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluar modelo
    predictions = model.predict(X_test)
    print("Accuracy:", accuracy_score(y_test, predictions))
    return model, vectorizer

# Clasificación
def classify_similarity(model, vectorizer, name1, name2, threshold=0.85):
    name1 = preprocess_name(name1)
    name2 = preprocess_name(name2)
    similarity_score = calculate_similarity(name1, name2)
    
    if similarity_score >= threshold:
        return "Similares (Alta confianza)"
    else:
        # Usar modelo de ML para decisiones complejas
        input_vec = vectorizer.transform([name1 + " " + name2])
        prediction = model.predict(input_vec)[0]
        return "Similares" if prediction == 1 else "Diferentes"

# Datos de ejemplo para entrenamiento
data = pd.DataFrame({
    'name1': ['Av Libertador', 'Dieciocho de Julio', 'St John', 'Main Rd'],
    'name2': ['Avenida Libertador', '18 de Julio', 'Saint John', 'Main Road'],
    'similar': [1, 1, 1, 1]  # 1 para similares, 0 para diferentes
})

# Entrenar modelo
print("Entrenando modelo...")
model, vectorizer = train_model(data)

# Pruebas
print("\nResultados de prueba:")
tests = [
    ("Av Libertador", "Avenida Libertador"),
    ("Dieciocho de Julio", "18 de Julio"),
    ("St John", "Saint John"),
    ("Main Rd", "Main Road"),
    ("Paseo Colón", "Colon Avenue")
]

for name1, name2 in tests:
    result = classify_similarity(model, vectorizer, name1, name2)
    print(f"Comparación: '{name1}' vs '{name2}' → {result}")
