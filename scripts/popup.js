async function displayPopup(movieId){
    let popup = document.querySelector(".popup-background");
    popup.classList.add("flex");
    let movie = await getMovie(movieId);

    popup.querySelector("#movie-title").innerText = movie["original_title"];
    popup.querySelector("#movie-description").innerText = movie["long_description"];
    let image = popup.querySelector("img");
    image.src = movie["image_url"];
    image.onerror = () => {
        image.src = "images/no-image.jpg";
    };
    image.src = movie["image_url"];

    let genresString = movie["genres"].toString();
    genresString = genresString.replaceAll(",", ", ");
    popup.querySelector("#movie-date").innerText = movie["year"] + " - " + genresString;

    let pegi = popup.querySelector("#movie-pegi");
    let countries = movie["countries"].toString();
    countries = "(" + countries.replace(",", " / ") + ")";
    let duration = movie["duration"] + " minutes";
    pegi.innerText = movie["rated"].includes("Not") ? "Not rated" : movie["rated"];
    pegi.innerText += " - " + duration + " " + countries;

    let movieScore = popup.querySelector("#movie-score");
    movieScore.innerText = "IMDB score: " + movie["imdb_score"] + "/10";

    let movieReal = popup.querySelector("#movie-real");
    movieReal.innerText = movie["directors"].toString().replaceAll(",", ", ");

    let movieActors = popup.querySelector("#movie-actors");
    let actors = movie["actors"].toString();
    actors = actors.replaceAll(",", ", ");
    movieActors.innerText = actors;
}

function hidePopup(){
    let popup = document.querySelector(".popup-background");
    popup.classList.remove("flex");
}

function initClosePopupEventListener() {
    let closeButton = document.querySelector("#close-popup");
    closeButton.addEventListener("click", hidePopup);
}