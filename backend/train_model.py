import numpy as np
import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder, OrdinalEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor

# Load dataset - try multiple sources
urls = [
    "https://raw.githubusercontent.com/towhidul-islam-munna/Car-Price-Prediction/main/CarPrice_Assignment.csv",
    "https://raw.githubusercontent.com/edyoda/data-science-complete-tutorial/master/Data/CarPrice_Assignment.csv"
]

df = None
for url in urls:
    try:
        df = pd.read_csv(url)
        print(f"Dataset loaded from: {url}")
        break
    except:
        continue

if df is None:
    # Fallback: use a local copy if exists
    try:
        df = pd.read_csv("CarPrice_Assignment.csv")
        print("Dataset loaded from local file")
    except:
        print("ERROR: Could not load dataset. Please ensure CarPrice_Assignment.csv is in the backend folder.")
        exit(1)

print(f"Dataset shape: {df.shape}")
print(f"Columns: {list(df.columns)}")

# Separate features and target
X = df.drop('price', axis=1).copy()
y = df['price']

# Drop unnecessary columns as done in the notebook
X.drop(['car_ID', 'symboling', 'stroke', 'compressionratio', 'peakrpm', 'CarName'], axis=1, inplace=True)

# Define feature types
numerical_features = X.select_dtypes(['int', 'float']).columns.tolist()
cat_features = X.select_dtypes('object').columns.tolist()

nom_features = ['fueltype', 'aspiration', 'enginelocation', 'cylindernumber', 'fuelsystem']
ord_features = ['doornumber', 'carbody', 'drivewheel', 'enginetype']

# Build pipelines
num_pipeline = Pipeline([
    ('impute', SimpleImputer(strategy='median')),
    ('scale', StandardScaler())
])

ord_pipeline = Pipeline([
    ('ordinal_encoder', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1))
])

nom_pipeline = Pipeline([
    ('one_hot_encoder', OneHotEncoder(sparse_output=False, handle_unknown='ignore'))
])

# Transform data
X_num = X.select_dtypes(['int', 'float'])
X_ord = X[ord_features]
X_nom = X[nom_features]

X_num_tr = num_pipeline.fit_transform(X_num)
X_ord_tr = ord_pipeline.fit_transform(X_ord)
X_nom_tr = nom_pipeline.fit_transform(X_nom)

# Combine all features
X_final = np.concatenate((X_num_tr, X_ord_tr, X_nom_tr), axis=1)

# Get column names
cols = list(numerical_features) + ord_features + list(nom_pipeline.get_feature_names_out())
X_final = pd.DataFrame(X_final, columns=cols)

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X_final, y, test_size=0.2, random_state=123)

# Train RandomForest model (best performing from notebook)
model = RandomForestRegressor(n_estimators=100, random_state=123)
model.fit(X_train, y_train)

# Evaluate
train_score = model.score(X_train, y_train)
test_score = model.score(X_test, y_test)
print(f"Train R2 Score: {train_score:.4f}")
print(f"Test R2 Score: {test_score:.4f}")

# Save the model and preprocessors
artifacts = {
    'model': model,
    'num_pipeline': num_pipeline,
    'ord_pipeline': ord_pipeline,
    'nom_pipeline': nom_pipeline,
    'numerical_features': numerical_features,
    'ord_features': ord_features,
    'nom_features': nom_features
}

with open("model.pkl", "wb") as f:
    pickle.dump(artifacts, f)

print("Model saved as model.pkl")
print("Done!")

