from flask import Flask, jsonify
from flask_cors import CORS
import requests
from functools import lru_cache

app = Flask(__name__)
CORS(app)  # Enable CORS

BASE_URL = "https://www.themealdb.com/api/json/v1/1/"

# Cache to reduce repeated requests
@lru_cache(maxsize=128)
def get_meal_details(meal_id):
    resp = requests.get(f"{BASE_URL}lookup.php?i={meal_id}").json()
    meal_info = resp.get('meals')[0]
    return {
        "id": meal_info.get('idMeal'),
        "name": meal_info.get('strMeal'),
        "category": meal_info.get('strCategory'),
        "area": meal_info.get('strArea'),
        "image": meal_info.get('strMealThumb'),
        "instructions": meal_info.get('strInstructions'),
        "youtube": meal_info.get('strYoutube')
    }

# Search meals by name
@app.route('/search')
def search_meal():
    from flask import request
    meal_name = request.args.get('meal')
    resp = requests.get(f"{BASE_URL}search.php?s={meal_name}").json()
    meals = resp.get('meals', [])
    result = []
    for m in meals:
        result.append({
            "id": m.get('idMeal'),
            "name": m.get('strMeal'),
            "category": m.get('strCategory'),
            "area": m.get('strArea'),
            "image": m.get('strMealThumb'),
            "instructions": m.get('strInstructions'),
            "youtube": m.get('strYoutube')
        })
    return jsonify({"meals": result})

# Random meal
@app.route('/random')
def random_meal():
    resp = requests.get(f"{BASE_URL}random.php").json()
    meal = resp.get('meals')[0]
    return jsonify({"meal": {
        "id": meal.get('idMeal'),
        "name": meal.get('strMeal'),
        "category": meal.get('strCategory'),
        "area": meal.get('strArea'),
        "image": meal.get('strMealThumb'),
        "instructions": meal.get('strInstructions'),
        "youtube": meal.get('strYoutube')
    }})

# Categories list
@app.route('/categories')
def categories():
    resp = requests.get(f"{BASE_URL}list.php?c=list").json()
    categories = [c['strCategory'] for c in resp.get('meals', [])]
    return jsonify({"categories": categories})

# Meals by category (with full details)
@app.route('/category/<category_name>')
def meals_by_category(category_name):
    resp = requests.get(f"{BASE_URL}filter.php?c={category_name}").json()
    meals_basic = resp.get('meals', [])
    full_meals = []
    for meal in meals_basic:
        full_meals.append(get_meal_details(meal['idMeal']))
    return jsonify({"meals": full_meals})

if __name__ == '__main__':
    app.run(debug=True)
