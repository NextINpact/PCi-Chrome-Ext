// On ne commence le rendu que quand le DOM est validé
window.addEventListener("DOMContentLoaded", function () {
    // On récupère le titre via l'adresse de la page
    var txt = decodeURIComponent(window.location.search.substring(1));
    var json = JSON.parse(txt);
    document.getElementById("titre").innerText = json.Titre;
    document.getElementById("logo").src = json.DedicatedImage;
    document.body.addEventListener('click', function(){window.open(json.Link)});
});