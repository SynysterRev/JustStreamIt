const URL = "http://localhost:8000/api/v1/titles/";

async function getBestMovie() {
    try {
        const response = await fetch(URL + "?sort_by=-imdb_score");
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();

        if (!json["results"] || json["results"].length === 0) {
            throw new Error("No movies found.");
        }
        const id = json["results"][0]["id"];

        return await getMovie(id);
    } catch (error) {
        console.error(error.message);
    }
}

async function getMovie(id) {
    try {
        const response = await fetch(URL + id);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error.message);
    }
}

async function getBestMoviesByGenre(genre) {
    try {
        let genreUrl = URL + "?sort_by=-imdb_score&genre=" + genre;
        let allMovies = [];
            const response = await fetch(genreUrl);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            const movies = await response.json();
            let ids = [];
            for (let i = 0; i < movies["results"].length; i++) {
                if (!movies["results"] || movies["results"].length === 0) {
                    throw new Error("No movies found.");
                }
                if (i > movies["results"].length) break;
                ids.push(movies["results"][i]["id"]);
            }

            const allMoviesPromise = Promise.all(ids.map(async (id) => {
                return await getMovie(id);
            }))
            allMoviesPromise.then(
                (movies) => {
                    movies.forEach(movie => {
                        allMovies.push(movie);
                    })
                }
            )

        if (!movies["next"]) return;

        const nextPageReponse = await fetch(movies["next"]);
        if (!nextPageReponse.ok) {
            throw new Error(`Response status: ${nextPageReponse.status}`);
        }
        const nextPage = await nextPageReponse.json();

        if (!nextPage["results"] || nextPage["results"].length === 0) {
            throw new Error("No movies found.");
        }

        const lastMovie = await getMovie(nextPage["results"][0]["id"]);
        allMovies.push(lastMovie);
        return allMovies;

    } catch (error) {
        console.error(error.message);
    }
}

function createMovieDiv(movie) {
    let movieDiv = document.createElement("div");
    movieDiv.classList.add("movie-container");
    movieDiv.innerHTML = `
            <img src="${movie["image_url"]}" alt="${movie["original_title"]}" onerror="this.oneerror=null; this.src='images/no-image.jpg'"/>
            <div class="movie-details">
                <h2>${movie["original_title"]}</h2>
                <button type="button">Détails</button>
            </div>
    `;
    return movieDiv;
}

async function getAllCategories() {
    try {
        let genreUrl = "http://localhost:8000/api/v1/genres/";
        let allGenres = [];
        while (genreUrl) {
            const response = await fetch(genreUrl);
            if(!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            const categories = await response.json();
            categories["results"].forEach(
                (genre) => {
                    allGenres.push(genre["name"]);
                });
            genreUrl = categories["next"];
        }
        return allGenres;

    } catch (error) {
        console.error(error.message);
    }
}

async function displayMoviesByGenre(genre) {
    let movies = await getBestMoviesByGenre(genre);
    movies.forEach((movie) => {
       let movieDiv = createMovieDiv(movie);
       let id = `#${genre.toLowerCase()}-grid`
       document.querySelector(id).appendChild(movieDiv);
    });

}

async function populateSelect() {
    const allGenres = await getAllCategories();
    let select = document.getElementById("movie-category-select")
    select.addEventListener("change", changeMoviesFromSelect)
    let selectTwo = document.getElementById("movie-category-select2")
    allGenres.forEach(
        (genre) => {
            const option = document.createElement("option");
            option.value = genre.toLowerCase();
            option.textContent = genre;
            select.appendChild(option);

            const optionTwo = document.createElement("option");
            optionTwo.value = genre.toLowerCase();
            optionTwo.textContent = genre;
            selectTwo.appendChild(optionTwo);
        }
    )
}

async function changeMoviesFromSelect(event) {
    let genre = event.target.value;

    let firstSelection = document.getElementById("first-selection");
    let movieContainers = firstSelection.getElementsByClassName("movie-container");
}

async function displayBestMovie() {
    let bestMovie = await getBestMovie();
    let movieDiv = document.querySelector("#best-movie");
    movieDiv.getElementsByTagName("h1")[0].innerText = bestMovie["original_title"];
    movieDiv.getElementsByTagName("img")[0].src = bestMovie["image_url"];
    movieDiv.getElementsByTagName("article")[0].innerText = bestMovie["long_description"];
    await displayMoviesByGenre("Mystery");
    await displayMoviesByGenre("Action");
    await displayMoviesByGenre("Thriller");
    await populateSelect();
}

document.addEventListener("DOMContentLoaded", displayBestMovie);