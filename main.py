from flask import Flask, request, jsonify, render_template
import requests

app = Flask(__name__, static_folder='static', template_folder='templates')
colab_url = None  # To store the Colab URL

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

# Endpoint to set the Colab URL
@app.route('/set_colab_url', methods=['POST'])
def set_colab_url():
    global colab_url
    data = request.json
    colab_url = data.get('colab_url')
    return jsonify({'message': 'Colab URL set successfully'})

# Endpoint to trigger the simulation and call Colab URL
@app.route('/simulate', methods=['POST'])
def simulate():
    if colab_url:
        try:
            # Extract simulation data from request
            simulation_data = request.json

            # Custom header
            headers = {
                'Content-Type': 'application/json',
                'bypass-tunnel-reminder': 'any_value' 
            }

            # Make the request to the Colab URL with the custom header
            response_text = requests.post(colab_url+'/predict', json=simulation_data, headers=headers)
            response_text = response_text.json()
            response_text = response_text['response']
            
            predicted_energy = response_text.split('### Response:')[1].strip()
            print(predicted_energy)
            return jsonify({'predicted_energy': predicted_energy})
        except Exception as e:
            return jsonify({'error': str(e)})
    else:
        return jsonify({'error': 'Colab URL not set yet'}), 400

if __name__ == "__main__":
    app.run(debug=True)
