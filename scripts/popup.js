async function displayPopup(movieId){
    let movie = await getMovie(movieId);

    let popup = document.querySelector("#popup-background");
    popup.classList.toggle("hidden");
    let body = document.querySelector("body");
    body.classList.toggle("overflow-hidden");

    popup.querySelector("#movie-title").innerText = movie["original_title"];
    popup.querySelector("#movie-description").innerText = movie["long_description"];
    let images = popup.querySelectorAll("img");
    images.forEach(image => {
    image.src = movie["image_url"];
    image.onerror = () => {
        image.src = "images/no-image.jpg";
    };
    image.src = movie["image_url"];
    });

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

    let movieRevenue = popup.querySelector("#movie-revenue");
    let revenue = movie["worldwide_gross_income"];
    movieRevenue.innerText = (revenue !== null) ? "Revenue : " + movie["worldwide_gross_income"] : "";

    let movieReal = popup.querySelector("#movie-real");
    movieReal.innerText = movie["directors"].toString().replaceAll(",", ", ");

    let movieActors = popup.querySelector("#movie-actors");
    let actors = movie["actors"].toString();
    actors = actors.replaceAll(",", ", ");
    movieActors.innerText = actors;
}

function hidePopup(){
    let popup = document.querySelector("#popup-background");
    popup.classList.toggle("hidden");
    let body = document.querySelector("body");
    body.classList.toggle("overflow-hidden");
}

function initClosePopupEventListener() {
    let popup = document.querySelector("#popup-background");
    let closeButtons = popup.querySelectorAll("button");
    closeButtons.forEach(button => {
        button.addEventListener("click", hidePopup);
    });
}