document.addEventListener("DOMContentLoaded", function () {
    const dropdown = document.getElementById("stateDropdown");
    const container = document.getElementById("historyContainer");

    // Load states list
    fetch("states.json")
        .then(response => response.json())
        .then(data => {
            Object.keys(data).forEach(state => {
                let option = document.createElement("option");
                option.value = state;
                option.textContent = state;
                dropdown.appendChild(option);
            });

            dropdown.addEventListener("change", function () {
                const selectedState = dropdown.value;
                container.innerHTML = "";

                if (!selectedState) {
                    container.innerHTML = "<p>Please select a state from the dropdown above.</p>";
                    return;
                }

                const events = data[selectedState];
                if (events.length === 0) {
                    container.innerHTML = "<p>No data available for this state.</p>";
                    return;
                }

                events.forEach(event => {
                    let div = document.createElement("div");
                    div.classList.add("event");
                    div.innerHTML = `<h3>${event.year}</h3><p>${event.description}</p>`;
                    container.appendChild(div);
                });
            });
        })
        .catch(error => {
            container.innerHTML = "<p>Error loading data.</p>";
            console.error(error);
        });
});
