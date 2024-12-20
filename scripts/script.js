const URL = "http://localhost:8000/api/v1/titles/";

let buttons = [];
let buttonIds = [];

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

        await Promise.all(ids.map(async (id) => {
            let movie = await getMovie(id);
            allMovies.push(movie);
        }))

        if (!movies["next"]) {
            return allMovies;
        }
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
    let button = movieDiv.querySelector("button");
    buttons.push(button);
    buttonIds.push(movie["id"]);
    return movieDiv;
}

async function getAllCategories() {
    try {
        let genreUrl = "http://localhost:8000/api/v1/genres/";
        let allGenres = [];
        while (genreUrl) {
            const response = await fetch(genreUrl);
            if (!response.ok) {
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
    let genreID = `#${genre.toLowerCase()}`;
    let id = `${genreID}-grid`;
    let grid = document.querySelector(id);
    movies.forEach((movie) => {
        let movieDiv = createMovieDiv(movie);
        grid.appendChild(movieDiv);
    });
    let buttonParent = document.querySelector(genreID);
    addMoreButton(buttonParent);
}

function addMoreButton(parent) {
    let moreButton = document.createElement("button");
    moreButton.classList.add("button-more");
    moreButton.type = "button";
    moreButton.innerText = "Voir plus";
    moreButton.addEventListener("click", displayMoreOrLessMovies);
    moreButton.id = "more-button";
    parent.appendChild(moreButton);
}

async function populateSelect() {
    const allGenres = await getAllCategories();
    let select = document.getElementById("movie-category-select")
    select.addEventListener("change", onChangeMoviesFromSelect)
    let selectTwo = document.getElementById("movie-category-select2")
    selectTwo.addEventListener("change", onChangeMoviesFromSelect)
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
    select.value = "adult";
    await changeMoviesFromSelect("adult", select);
    selectTwo.value = "adventure";
    await changeMoviesFromSelect("adventure", selectTwo);
}

async function onChangeMoviesFromSelect(event) {
    let genre = event.target.value;
    await changeMoviesFromSelect(genre, event.target);
}

async function changeMoviesFromSelect(genre, target) {
    let movies = await getBestMoviesByGenre(genre);
    let section = target.parentElement;
    let movieContainers = section.querySelectorAll(".movie-container");
    if (movieContainers.length === 0) {
        let grid = section.querySelector(".movie-grid");
        movies.forEach((movie) => {
            let movieDiv = createMovieDiv(movie);
            grid.appendChild(movieDiv);
        });
        addMoreButton(section);
    }
    else {
        for (let i = 0; i < movieContainers.length; i++) {
            if (movies[i]) {
                movieContainers[i].querySelector("h2").innerText = movies[i]["original_title"];
                let image = movieContainers[i].querySelector("img");
                image.src = movies[i]["image_url"];
                image.onerror = () => {
                    image.src = "images/no-image.jpg";
                }
                if (movieContainers[i].classList.contains("hidden"))
                    movieContainers[i].classList.remove("hidden");
                let button = movieContainers[i].querySelector("button");
                buttons.push(button);
                buttonIds.push(movies[i]["id"]);
            } else {
                movieContainers[i].classList.add("hidden");
            }
        }
    }
}

async function displayBestMovie() {
    let bestMovie = await getBestMovie();
    let movieDiv = document.querySelector("#best-movie");
    movieDiv.getElementsByTagName("h1")[0].innerText = bestMovie["original_title"];
    movieDiv.getElementsByTagName("img")[0].src = bestMovie["image_url"];
    movieDiv.getElementsByTagName("article")[0].innerText = bestMovie["long_description"];
    let button = movieDiv.querySelector("button");
    buttons.push(button);
    buttonIds.push(bestMovie["id"]);
}

function displayMoreOrLessMovies(event) {
    let grid = event.target.parentElement;
    let containers = grid.querySelectorAll(".movie-container");
    for (let i = 0; i < containers.length; i++) {
        containers[i].classList.toggle("force-display");
    }
    event.target.innerText = event.target.innerText === "Voir plus" ? "Voir moins" : "Voir plus";
}

async function loadMovies() {
    await displayBestMovie();
    await displayMoviesByGenre("Mystery");
    await displayMoviesByGenre("Action");
    await displayMoviesByGenre("Thriller");
    await populateSelect();
    let cpt = 0;
    buttons.forEach((button) => {
        let movieId = buttonIds[cpt];
        if (button.id !== "close-popup")
            button.addEventListener("click", () => displayPopup(movieId));
        cpt++;
    })
    initClosePopupEventListener();
}

document.addEventListener("DOMContentLoaded", loadMovies);