const form = document.getElementById("predictionForm");
const price = document.getElementById("price");
const predictBtn = document.querySelector(".predict-btn");

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    // Button Loading
    predictBtn.disabled = true;
    predictBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm"></span> Predicting...';

    // Form Data
    const data = {

        company: document.getElementById("company").value,
        model: document.getElementById("model").value,
        year: parseInt(document.getElementById("year").value),
        fuel: document.getElementById("fuel").value,
        transmission: document.getElementById("transmission").value,
        km_driven: parseFloat(document.getElementById("km").value),
        mileage: parseFloat(document.getElementById("mileage").value),
        engine: parseFloat(document.getElementById("engine").value),
        horsepower: parseFloat(document.getElementById("hp").value),
        seats: parseInt(document.getElementById("seats").value)

    };

    try {

        const response = await fetch("/predict", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)

        });

        const result = await response.json();

        if (result.predicted_price) {

            price.innerHTML =
                "₹ " + Number(result.predicted_price).toLocaleString("en-IN");

        } else if (result.price) {

            price.innerHTML =
                "₹ " + Number(result.price).toLocaleString("en-IN");

        } else if (result.error) {

            price.innerHTML = result.error;

        } else {

            price.innerHTML = "Prediction Failed";

        }

    }

    catch (error) {

        console.log(error);

        price.innerHTML = "Server Error";

    }

    predictBtn.disabled = false;

    predictBtn.innerHTML =
        '<i class="fa-solid fa-chart-line"></i> Predict Price';

});


// Reset Button

form.addEventListener("reset", function () {

    setTimeout(function () {

        price.innerHTML = "₹ --";

    }, 100);

});