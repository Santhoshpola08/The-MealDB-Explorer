// Elements
const searchBtn = document.getElementById('search-btn');
const randomBtn = document.getElementById('random-btn');
const categorySelect = document.getElementById('category-select');
const categoryBtn = document.getElementById('category-btn');
const resultsDiv = document.getElementById('results');
const loading = document.getElementById('loading');

// Modal elements
const modal = document.getElementById('meal-modal');
const modalTitle = document.getElementById('modal-title');
const modalImage = document.getElementById('modal-image');
const modalCategory = document.getElementById('modal-category');
const modalArea = document.getElementById('modal-area');
const modalInstructions = document.getElementById('modal-instructions');
const modalYoutube = document.getElementById('modal-youtube');
const closeBtn = document.querySelector('.close-btn');

// Helper: Show spinner and fetch
function fetchWithLoading(url, callback) {
    loading.style.display = 'block';
    fetch(url)
        .then(res => res.json())
        .then(data => {
            loading.style.display = 'none';
            callback(data);
        })
        .catch(err => {
            loading.style.display = 'none';
            console.error(err);
            resultsDiv.innerHTML = "<p style='color:red;'>Error fetching data. Please try again.</p>";
        });
}

// Load categories on page load
window.addEventListener('DOMContentLoaded', () => {
    fetchWithLoading('http://127.0.0.1:5000/categories', data => {
        if (data.categories) {
            data.categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                categorySelect.appendChild(option);
            });
        }
    });
});

// Search meals by name
searchBtn.addEventListener('click', () => {
    const mealName = document.getElementById('meal-input').value.trim();
    if (!mealName) return alert("Please enter a meal name");

    fetchWithLoading(`http://127.0.0.1:5000/search?meal=${mealName}`, data => {
        if (data.meals) displayMeals(data.meals);
        else resultsDiv.innerHTML = "<p>No meals found</p>";
    });
});

// Random meal
randomBtn.addEventListener('click', () => {
    fetchWithLoading('http://127.0.0.1:5000/random', data => {
        if (data.meal) displayMeals([data.meal]);
        else resultsDiv.innerHTML = "<p>No meal found</p>";
    });
});

// Meals by category
categoryBtn.addEventListener('click', () => {
    const category = categorySelect.value;
    if (!category) return alert("Please select a category");

    fetchWithLoading(`http://127.0.0.1:5000/category/${category}`, data => {
        if (data.meals) displayMeals(data.meals);
        else resultsDiv.innerHTML = "<p>No meals found</p>";
    });
});

// Display meals
function displayMeals(meals) {
    resultsDiv.innerHTML = "";

    if (!meals || meals.length === 0) {
        resultsDiv.innerHTML = "<p>No meals found</p>";
        return;
    }

    meals.forEach(meal => {
        const mealDiv = document.createElement('div');
        mealDiv.className = "meal-card";
        mealDiv.innerHTML = `
            <img src="${meal.image}" alt="${meal.name}">
            <div>
                <h3>${meal.name}</h3>
                ${meal.category ? `<p>Category: ${meal.category}</p>` : ''}
                ${meal.area ? `<p>Area: ${meal.area}</p>` : ''}
                ${meal.youtube ? `<a href="${meal.youtube}" target="_blank">YouTube</a>` : ''}
            </div>
        `;

        // Open modal on click
        mealDiv.onclick = () => openModal(meal);

        resultsDiv.appendChild(mealDiv);
    });
}

// Modal functionality
function openModal(meal) {
    modalTitle.textContent = meal.name;
    modalImage.src = meal.image;
    modalCategory.textContent = meal.category ? `Category: ${meal.category}` : '';
    modalArea.textContent = meal.area ? `Area: ${meal.area}` : '';
    modalInstructions.textContent = meal.instructions || '';

    if (meal.youtube) {
        modalYoutube.innerHTML = `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${extractYouTubeID(meal.youtube)}" frameborder="0" allowfullscreen></iframe>`;
    } else {
        modalYoutube.innerHTML = '';
    }

    modal.style.display = 'block';
}

// Close modal
closeBtn.onclick = () => { modal.style.display = 'none'; }
window.onclick = (event) => { if (event.target === modal) modal.style.display = 'none'; }

// Extract YouTube ID
function extractYouTubeID(url) {
    const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[1].length == 11) ? match[1] : null;
}
