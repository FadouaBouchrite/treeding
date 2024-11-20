from flask import Flask, jsonify
from flask_cors import CORS
import yfinance as yf
from datetime import datetime
import threading
import time

app = Flask(__name__)
CORS(app)

# Initialiser l'objet Ticker pour l'action Apple
ticker = yf.Ticker("AAPL")

# Variable pour stocker les dernières données
latest_data = None

def fetch_real_time_data():
    """Fonction pour récupérer les données de marché en temps réel."""
    global latest_data
    today = datetime.now().date()  # Obtenir la date actuelle

    while True:
        try:
            # Obtenir les données pour aujourd'hui avec un intervalle d'une minute
            apple_data = ticker.history(period="1d", interval="1m")

            if not apple_data.empty:
                # Filtrer les données pour ne garder que celles d'aujourd'hui
                today_data = apple_data[apple_data.index.date == today]

                # Mettre à jour les dernières données si disponibles
                if not today_data.empty:
                    new_data = today_data.tail(1)  # Dernière ligne

                    # Mettre à jour uniquement si les données sont nouvelles
                    if not new_data.equals(latest_data):
                        latest_data = new_data
                        print("Nouvelles données récupérées :", new_data)
            else:
                print("Aucune donnée disponible pour le moment.")
            
            # Attendre une minute avant de récupérer les nouvelles données
            time.sleep(60)
        
        except Exception as e:
            print("Erreur lors de la récupération des données :", e)
            time.sleep(60)

@app.route('/latest-data', methods=['GET'])
def get_latest_data():
    """Endpoint pour récupérer les dernières données."""
    if latest_data is not None:
        # Convertir les données en JSON
        latest_dict = latest_data.iloc[0].to_dict()  # Convertir la première ligne en dictionnaire
        return jsonify(latest_dict)
    else:
        return jsonify({"message": "Aucune donnée disponible pour aujourd'hui."}), 404

if __name__ == '__main__':
    # Lancer un thread pour récupérer les données en arrière-plan
    data_thread = threading.Thread(target=fetch_real_time_data, daemon=True)
    data_thread.start()

    # Démarrer l'application Flask
app.run(debug=True, port=5001)  # Utiliser le port 5001
