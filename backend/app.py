from flask import Flask, render_template, request, jsonify
import pandas as pd
import pickle
import numpy as np

app = Flask(__name__)

# Load ML Model and artifacts
artifacts = pickle.load(open("model.pkl", "rb"))
model = artifacts['model']
num_pipeline = artifacts['num_pipeline']
ord_pipeline = artifacts['ord_pipeline']
nom_pipeline = artifacts['nom_pipeline']
numerical_features = artifacts['numerical_features']
ord_features = artifacts['ord_features']
nom_features = artifacts['nom_features']


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json()

        # Build input DataFrame with all required features
        input_dict = {
            # Numerical features from form mapping
            "wheelbase": float(data.get("wheelbase", 98.0)),
            "carlength": float(data.get("carlength", 170.0)),
            "carwidth": float(data.get("carwidth", 65.0)),
            "carheight": float(data.get("carheight", 54.0)),
            "curbweight": float(data.get("curbweight", 2500)),
            "enginesize": float(data.get("engine", 130)),
            "boreratio": float(data.get("boreratio", 3.3)),
            "horsepower": float(data.get("horsepower", 100)),
            "citympg": float(data.get("citympg", 25)),
            "highwaympg": float(data.get("highwaympg", 30)),

            # Ordinal features
            "doornumber": data.get("doornumber", "four"),
            "carbody": data.get("carbody", "sedan"),
            "drivewheel": data.get("drivewheel", "fwd"),
            "enginetype": data.get("enginetype", "ohc"),

            # Nominal features
            "fueltype": data.get("fuel", "gas"),
            "aspiration": data.get("aspiration", "std"),
            "enginelocation": data.get("enginelocation", "front"),
            "cylindernumber": data.get("cylindernumber", "four"),
            "fuelsystem": data.get("fuelsystem", "mpfi")
        }

        input_df = pd.DataFrame([input_dict])

        # Apply preprocessing pipelines
        X_num = input_df[numerical_features]
        X_ord = input_df[ord_features]
        X_nom = input_df[nom_features]

        X_num_tr = num_pipeline.transform(X_num)
        X_ord_tr = ord_pipeline.transform(X_ord)
        X_nom_tr = nom_pipeline.transform(X_nom)

        # Combine all features
        X_final = np.concatenate((X_num_tr, X_ord_tr, X_nom_tr), axis=1)

        # Predict
        prediction = model.predict(X_final)

        return jsonify({
            "predicted_price": round(float(prediction[0]), 2)
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        })


if __name__ == "__main__":
    app.run(debug=True)
