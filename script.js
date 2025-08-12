const states = [
    "India", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry"
];

window.onload = () => {
    const stateSelect = document.getElementById("state");
    states.forEach(state => {
        let option = document.createElement("option");
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });

    document.getElementById('getBtn').addEventListener('click', fetchData);
};

function fetchData() {
    const state = document.getElementById("state").value;
    const language = document.getElementById("language").value;
    const output = document.getElementById("output");

    if (!state) {
        output.innerHTML = `<p>Please select a state.</p>`;
        return;
    }

    output.innerHTML = `<p>Loading information...</p>`;

    // Wikipedia API endpoint - uses language subdomain
    const url = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(state)}`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Data not found");
            return response.json();
        })
        .then(data => {
            if (data.extract) {
                output.innerHTML = `
                    <h2>${data.title}</h2>
                    <p>${data.extract}</p>
                    ${data.thumbnail ? `<img src="${data.thumbnail.source}" style="max-width:100%;border-radius:8px;">` : ""}
                    <p><a href="${data.content_urls ? data.content_urls.desktop.page : 'https://' + language + '.wikipedia.org/wiki/' + encodeURIComponent(state)}" target="_blank" rel="noopener">Read more on Wikipedia</a></p>
                `;
            } else {
                output.innerHTML = `<p>No data available for this selection.</p>`;
            }
        })
        .catch((err) => {
            console.error(err);
            // Fallback: try English Wikipedia if selected language failed
            if (language !== 'en') {
                output.innerHTML = `<p>Could not fetch in the selected language, trying English...</p>`;
                fetchEnglishFallback(state, output);
            } else {
                output.innerHTML = `<p>Could not fetch data. Try again later.</p>`;
            }
        });
}

function fetchEnglishFallback(state, output) {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(state)}`;
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error("English fallback failed");
        return r.json();
      })
      .then(data => {
        if (data.extract) {
          output.innerHTML = `
              <h2>${data.title}</h2>
              <p>${data.extract}</p>
              ${data.thumbnail ? `<img src="${data.thumbnail.source}" style="max-width:100%;border-radius:8px;">` : ""}
              <p><a href="${data.content_urls ? data.content_urls.desktop.page : 'https://en.wikipedia.org/wiki/' + encodeURIComponent(state)}" target="_blank" rel="noopener">Read more on Wikipedia</a></p>
          `;
        } else {
          output.innerHTML = `<p>No English data available either.</p>`;
        }
      })
      .catch(e => {
        console.error(e);
        output.innerHTML = `<p>Could not fetch data. Try again later.</p>`;
      });
}
