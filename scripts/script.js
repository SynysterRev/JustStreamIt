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

        await Promise.all(ids.map(async (id) => {
            let movie = await getMovie(id);
            allMovies.push(movie);
        }))

        if (!movies["next"]) {
            return allMovies;
        }
        const nextPageResponse = await fetch(movies["next"]);
        if (!nextPageResponse.ok) {
            throw new Error(`Response status: ${nextPageResponse.status}`);
        }
        const nextPage = await nextPageResponse.json();

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
    if (movie) {
        movieDiv.innerHTML = `
            <img src="${movie["image_url"]}" alt="${movie["original_title"]}" onerror="this.oneerror=null; this.src='images/no-image.jpg'"/>
            <div class="movie-details">
                <h2>${movie["original_title"]}</h2>
                <button type="button">Détails</button>
            </div>
    `;
    } else {
        movieDiv.classList.add("hidden-important");
        movieDiv.innerHTML = `
            <img src="" alt="" onerror="this.oneerror=null; this.src='images/no-image.jpg'"/>
            <div class="movie-details">
                <h2></h2>
                <button type="button">Détails</button>
            </div>
    `;
    }
    let button = movieDiv.querySelector("button");
    let movieId = movie ? movie["id"] : -1;
    button.addEventListener("click", () => displayPopup(movieId));

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
        for (let i = 0; i < 6; ++i) {
            let movieDiv = createMovieDiv(movies[i] ?? null);
            grid.appendChild(movieDiv);
        }
        addMoreButton(section);
    } else {
        for (let i = 0; i < movieContainers.length; i++) {
            if (movies[i]) {
                movieContainers[i].querySelector("h2").innerText = movies[i]["original_title"];
                let image = movieContainers[i].querySelector("img");
                image.src = movies[i]["image_url"];
                image.onerror = () => {
                    image.src = "images/no-image.jpg";
                }
                if (movieContainers[i].classList.contains("hidden-important"))
                    movieContainers[i].classList.remove("hidden-important");
                let button = movieContainers[i].querySelector("button");
                button.replaceWith(button.cloneNode(true));
                button = movieContainers[i].querySelector("button");
                button.addEventListener("click", () => displayPopup(movies[i]["id"]));
            } else {
                movieContainers[i].classList.add("hidden-important");
            }
        }
    }
    // Hide "more button" if there is fewer movies than maximum displayed at the time
    let btn = section.querySelector(".button-more");
    let numberDisplayedMovies = matchMedia("(max-width: 640px)").matches ? 2 : matchMedia("(max-width: 1024px)").matches ? 4 : 6;
    if (movies.length <= numberDisplayedMovies) {
        btn.classList.add("hidden-important");
    } else
    {
        if(btn.classList.contains("hidden-important"))
            btn.classList.remove("hidden-important");
    }
}

async function displayBestMovie() {
    let bestMovie = await getBestMovie();
    let movieDiv = document.querySelector("#best-movie");
    movieDiv.querySelector("h1").innerText = bestMovie["original_title"];
    let image =  movieDiv.querySelector("img");
    image.src = bestMovie["image_url"];
    image.onerror = () => {
        image.src = "images/no-image.jpg";
    }
    movieDiv.querySelector("article").innerText = bestMovie["long_description"];
    let button = movieDiv.querySelector("button");
    button.addEventListener("click", () => displayPopup(bestMovie["id"]));
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
    initClosePopupEventListener();
}

document.addEventListener("DOMContentLoaded", loadMovies);