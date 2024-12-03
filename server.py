import Levenshtein
from word2number import w2n  # Convierte texto a número
import inflect  # Convierte número a texto
from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
import re
import pickle
import os
import unicodedata
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import numpy as np
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight

app = Flask(__name__)

# Inicialización del modelo y vectorizador
MODEL_FILE = 'street_model.pkl'
VECTORIZER_FILE = 'vectorizer.pkl'

# Configuración global del geolocalizador
geolocator = Nominatim(user_agent="geoapi")

# Inicializa el convertidor de números a palabras
inflect_engine = inflect.engine()

# Función para manejar conversiones de números en texto y viceversa
def replace_numbers(name):
    number_map = {
        'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
        'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
        'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15,
        'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19,
        'veinte': 20
    }
    reverse_map = {v: k for k, v in number_map.items()}
    words = name.lower().split()
    result = []
    for word in words:
        if word in number_map:
            result.append(str(number_map[word]))
        elif word.isdigit() and int(word) in reverse_map:
            result.append(reverse_map[int(word)])
        else:
            result.append(word)
    return ' '.join(result)

# Funciones de preprocesamiento
def normalize_name(name):
    name = name.lower()
    name = re.sub(r'[^a-z0-9\s]', ' ', name)  # Reemplaza caracteres no alfanuméricos
    name = re.sub(r'\s+', ' ', name).strip()  # Elimina espacios múltiples
    return name

def preprocess_name(name):
    name = normalize_name(name)
    name = replace_numbers(name)
    return name

def calculate_features(name1, name2):
    name1 = preprocess_name(name1)
    name2 = preprocess_name(name2)
    distance = Levenshtein.distance(name1, name2)
    similarity = 1 - (distance / max(len(name1), len(name2)))
    input_vec = vectorizer.transform([name1 + " " + name2]).toarray()
    features = np.hstack([input_vec, [[distance, similarity]]])
    return features, distance, similarity

# Inicialización del modelo y vectorizador
if os.path.exists(MODEL_FILE) and os.path.exists(VECTORIZER_FILE):
    with open(MODEL_FILE, 'rb') as model_file, open(VECTORIZER_FILE, 'rb') as vectorizer_file:
        model = pickle.load(model_file)
        vectorizer = pickle.load(vectorizer_file)
else:
    model = LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42)
    vectorizer = CountVectorizer()

    # Definir datos de entrenamiento
    training_data = [
        ("dieciocho de julio", "18 de julio", 2),
        ("calle veinte y tres", "calle 23", 2),
        ("avenida falsa 123", "calle siempreviva", 0),
        ("uno dos tres", "123", 2),
        ("Antonio Camacho", "Avenida Antonio Camacho", 1),
        ("Avenida Gral Flores", "Avenida Bulevar Artigas", 0),
        ("Millan", "Avenida Millan", 1),
        ("Avenida Millán", "Av. Millan", 2),
        ("Cno Lecoq", "Lecoq", 2),
        ("Camino Lecoq", "Cno Lecoq", 2),
        ("Humberto", "Hungria", 0),
        ("San Martin", "Av. San Antonio", 1),
        ("18 de julio", "Avenida 18 de julio", 1),
        ("veinticinco de mayo", "4 de julio", 0),
        ("diecinueve de julio", "19 de julio", 2),
        ("Avenida Gral Flores", "Avenida General Artigas", 1),
        ("Avenida Gral Flores", "General Flores", 2),
    ]

    all_sentences = [
        preprocess_name(name1) + " " + preprocess_name(name2)
        for name1, name2, _ in training_data
    ]
    vectorizer.fit(all_sentences)

    X_train = []
    y_train = []
    for name1, name2, label in training_data:
        features, _, _ = calculate_features(name1, name2)
        X_train.append(features[0])
        y_train.append(label)

    X_train, X_test, y_train, y_test = train_test_split(X_train, y_train, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    model.fit(X_train, y_train)

    with open(MODEL_FILE, 'wb') as model_file:
        pickle.dump(model, model_file)
    with open(VECTORIZER_FILE, 'wb') as vectorizer_file:
        pickle.dump(vectorizer, vectorizer_file)

    print("\nEstadísticas del modelo entrenado:")
    y_pred = model.predict(X_train)
    print(f"Accuracy: {accuracy_score(y_train, y_pred):.2f}")
    print("Confusion Matrix:")
    print(confusion_matrix(y_train, y_pred))
    print("\nClassification Report:")
    print(classification_report(y_train, y_pred))

    print("\nClasificación de datos de prueba:")
    for name1, name2, label in training_data:
        features, distance, similarity = calculate_features(name1, name2)
        prediction = model.predict(features)[0]
        print(f"Entrada: {name1} + {name2} → Predicción: {prediction}, Esperado: {label}")
        print(f"  Levenshtein Distance: {distance}, Similarity Score: {similarity:.2f}")

@app.route('/compare', methods=['POST'])
def compare_streets():
    try:
        data = request.get_json()
        name1 = data.get('name1', '')
        name2 = data.get('name2', '')
        feedback = data.get('feedback', None)
        if not name1 or not name2:
            return jsonify({"error": "Ambos campos name1 y name2 son requeridos"}), 400
        features, distance, similarity = calculate_features(name1, name2)
        prediction = model.predict(features)[0]
        decision_scores = model.decision_function(features)[0]
        score = decision_scores[prediction]
        rounded_score = round(float(score), 2)
        if similarity == 1.0:
            result = "Exactas"
        elif prediction == 1 and similarity >= 0.60:
            result = "Similares"
        else:
            result = "Diferentes"
        if feedback is not None:
            model.partial_fit(features, [int(feedback)])
            with open(MODEL_FILE, 'wb') as model_file:
                pickle.dump(model, model_file)
        return jsonify({
            "name1": name1,
            "name2": name2,
            "result": result,
            "levenshtein_distance": distance,
            "similarity_score": round(similarity, 2),
            "prediction_score": rounded_score
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/geolocate', methods=['POST'])
def geolocate():
    try:
        raw_data = request.get_data(as_text=False)
        try:
            data = request.get_json()
            if not data:
                raise ValueError("El cuerpo del request está vacío o no es JSON válido")
        except Exception:
            decoded_data = raw_data.decode('latin-1')
            return jsonify({"error": "El request no contiene un JSON válido"}), 400
        address = data.get('address', '')
        address = unicodedata.normalize('NFKD', address).encode('ascii', 'ignore').decode('utf-8')
        if not address:
            return jsonify({"error": "El campo 'address' es requerido"}), 400
        location = geolocator.geocode(address, timeout=10)
        if location:
            return jsonify({
                "name": location.raw.get("name"),
                "latitude": location.latitude,
                "longitude": location.longitude
            })
        else:
            return jsonify({"error": "No se pudo geolocalizar la dirección"}), 404
    except (GeocoderTimedOut, GeocoderServiceError) as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
