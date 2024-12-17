function displayPopup(){
    let popup = document.querySelector(".popup-background");
    popup.classList.add("flex");
}

function hidePopup(){
    let popup = document.querySelector(".popup-background");
    popup.classList.remove("flex");
}

function initClosePopupEventListener() {
    let closeButton = document.querySelector("#close-popup");
    closeButton.addEventListener("click", hidePopup);
}