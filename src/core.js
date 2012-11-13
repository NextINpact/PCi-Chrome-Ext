/*  Copyright © 2011-2012 LEGRAND David <david@pcinpact.com>

 This file is part of PC INpact Toolkit for Chrome™.

 PC INpact Toolkit for Chrome™ is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 PC INpact Toolkit for Chrome™ is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with PC INpact Toolkit for Chrome™.  If not, see <http://www.gnu.org/licenses/>. */

'use strict';

// On ne commence le rendu que quand le DOM est validé
window.addEventListener("DOMContentLoaded", function () {

    // On rajoute un EventListener sur le menu afin de gérer les clics
    var menu = document.getElementById("menu_list");
    menu.addEventListener("click", function (e) {
        change_menu_state(e, true);
        localStorage["lastRub"] = e.target.id;
        fill_in_container(e.target.id)
    }, false);

    // On récupère le nombre d'actus / brèves
    var newActusCount;

    chrome.extension.sendRequest({
        message:"getNewActusCount"
    }, function (response) {

        newActusCount = response;

        // On vérifie la rubrique à ouvrir
        checkSectionToOpen(newActusCount);

        // On effectue un RAZ du nombre d'actus / brèves
        chrome.extension.sendRequest({
            message:"clearNewActusCount"
        });

        // On affiche le header
        show_header(false);

        // On affiche le contenu de la rubrique demandé
        fill_in_container(localStorage["lastRub"]);
    });

}, false);

function checkSectionToOpen(newActusCount) {
    // On définit la rubrique à ouvrir, et on l'active dans le menu
    // Par défaut, ou si le nombre d'actus / brèves à lire est > 0, on ouvre "home"
    if (!localStorage["lastRub"] || (newActusCount && parseInt(newActusCount) > 0)) localStorage["lastRub"] = "home";

    // S'il y a des contenus dans le forum, on ouvre "forum"
    else if (localStorage["PCiForumLastCheck"]) {
        var forum_infos = JSON.parse(localStorage["PCiForumLastCheck"]);
        if (forum_infos.messages && forum_infos.notifications && (forum_infos.messages.count > 0 || forum_infos.notifications.count > 0)) localStorage["lastRub"] = "forum";
    }

    // Sinon et si la rubrique à afficher n'est pas "home", on sélectionne l'élément dédié dans le menu
    // On précise que la demande ne vient pas d'un évènement via "false"
    if (localStorage["lastRub"] != "home") change_menu_state(document.getElementById(localStorage["lastRub"]), false);
}

// La fonction qui gère la sélection des éléments du menu
function change_menu_state(e, event) {

    // La zone à gérer est différente si la demande vient d'un évènement ou pas
    var element = event ? e.target : e;

    // On prend l'ensemble des liens du menu, et on supprime la classe de tous les éléments dont l'id commence par "li-"
    for (var i = 0; i < element.parentNode.parentNode.getElementsByTagName("a").length; i++) {
        var id = element.parentNode.parentNode.getElementsByTagName("a")[i].id;
        document.getElementById("li-" + id).className = "";
    }

    // Pour l'élément qui a été cliqué, on rajoute la classe "active"
    document.getElementById("li-" + element.id).className = "active";
}

// La fonction qui vide une zone
function empty_zone(zone) {
    while (zone.hasChildNodes()) {
        zone.removeChild(zone.childNodes[0])
    }
}

// La fonction qui gère le remplissage du header
function show_header(lite) {

    // On définit les zones qui seront à exploiter
    var user_zone = document.getElementById("user_zone");
    var welcome = document.getElementById("welcome");
    var thanks = document.getElementById("thanks");
    var prem_btn = document.getElementById("li-premium");

    // En fonction de ce qui a été demandé, on affiche ou pas la zone réservée à l'utilisateur
    user_zone.style.display = lite ? "none" : "block";

    // On demande les informations relatives à l'utilisateur et on
    chrome.extension.sendRequest({
        message:"ask_user_cache"
    }, function (user) {

        // On définit les textes qui seront utilisés
        var txt_premium = "Merci pour votre abonnement Premium !";
        var txt_inpactien = "PC INpact, plus INdépendant, sans publicité :";
        var login = user.IsPremium ? user.Login : "";

        // On met en forme la zone
        var welcome_h3 = document.createElement("H3");
        welcome.appendChild(welcome_h3);

        var thanks_h3 = document.createElement("H3");
        var thanks_small = document.createElement("Small");
        thanks.appendChild(thanks_h3);
        thanks_h3.appendChild(thanks_small);

        // On affiche le message de bienvenue
        welcome_h3.innerText = "Bienvenue, " + login;

        // Si l'utilisateur est enregistré
        if (user.IsRegistered) {
            // On rajoute une croix qui permet de se déconnecter
            var deco_x = document.createElement("span");
            deco_x.innerText = "X";
            deco_x.id = "menu_deco";
            deco_x.style.cursor = "pointer";
            deco_x.style.color = "white";
            deco_x.title = "Vous déconnecter de PC INpact";
            welcome_h3.appendChild(deco_x);

            // Si l'élément créé est cliqué, on déconnecte l'utilisateur
            document.getElementById("menu_deco").addEventListener("click", function () {
                chrome.tabs.create({
                    "url":"http://www.pcinpact.com/Account/LogOff?url=http%3A%2F%2Fwww.pcinpact.com%2F"
                });
            });
        }

        // Si l'utilisateur est membre Premium
        if (user.IsPremium == true) {
            // On affiche le texte spécifique aux Premium ainsi que le bouton dédié dans le menu
            thanks.innerText = " " + txt_premium;
            prem_btn.style.display = "block";
        }
        // Si l'utilisateur est un simple membre
        else {

            // On créé un lien vers la page d'abonnement
            var abo_link = document.createElement("a");
            abo_link.href = "http://www.pcinpact.com/abonnement";
            abo_link.target = "_blank";
            abo_link.innerText = "abonnement Premium";
            abo_link.style.color = "white";
            abo_link.title = "Abonnez-vous !";

            // On rajoute le lien propre aux membres ainsi que le lien vers la zone d'abonnement
            thanks.innerText = " " + txt_inpactien + " ";
            thanks.appendChild(abo_link);

            // On cache le bouton Premium
            prem_btn.style.display = "none";
        }
    });
}

// La fonction qui gère le remplissage de la zone principale
function fill_in_container(type) {

    var mainDiv = document.getElementById("bloc_central");
    var footerDiv = document.getElementById("footer");

    // Par défaut on rend le footer invisible, il sera affiché sur demande
    footerDiv.style.display = "none";

    switch (type) {
        case "bp":
            chrome.extension.sendRequest({
                message:"ask_bp_cache"
            }, function (response) {
                update_content_bp(mainDiv, response);
            });
            break;

        case "cal":
            update_content_cal(mainDiv);
            break;

        case "emploi":
            chrome.extension.sendRequest({
                message:"askEmploiCache"
            }, function (response) {
                update_content_emploi(mainDiv, response);
            });
            break;

        case "forum":
            chrome.extension.sendRequest({
                message:"ask_forum_cache"
            }, function (response) {
                update_content_forum(mainDiv, response);
            });
            break;

        case "premium":
            chrome.extension.sendRequest({
                message:"ask_user_cache"
            }, function (response) {
                update_content_premium(mainDiv, response);
            });
            break;

        case "search":
            update_content_search(mainDiv);
            break;

        default:
            chrome.extension.sendRequest({
                message:"ask_news_cache"
            }, function (response) {
                update_content_news(mainDiv, response, type);
            });
            break;
    }
}

// La fonction qui gère l'affichage du footer
function setFooter(text) {

    var footer = document.getElementById("footer");

    footer.innerText = text;
    footer.style.display = (text === "") ? "none" : "block";
}