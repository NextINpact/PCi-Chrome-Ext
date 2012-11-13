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

// On utilise une IIFE pour éviter la nuisance
(function () {

    'use strict';

    // L'objet de gestion du nombre de nouvelles actualités
    var newActusCount = {
        localVarName:"newActusCount",

        get:function () {
            // On déclare un compteur
            var countNew = 0;

            // Si un compteur avait déjà été créé, on récupère sa valeur
            if (sessionStorage[newActusCount.localVarName]) countNew = parseInt(sessionStorage[newActusCount.localVarName]);

            return countNew;
        },

        inc:function () {
            var countNew = newActusCount.get(), countFinal;

            // On incrémente le compteur et on l'enregistre
            countFinal = parseInt(countNew) + 1;
            sessionStorage[newActusCount.localVarName] = countFinal;

            PCi.tools.logMessage("Compteur : " + countFinal);
        }

    };

    // La fonction qui indique les valeurs par défaut
    function setDefaultValues() {
        localStorage["notifCheck"] = 1;
        localStorage["notifDelay"] = 10;
        localStorage["PCiEnableLog"] = 1;
    }

    // La fonction qui gère les websockets et la récupération des actus
    function websocketLaunch() {

        // On initialise
        PCiRT.Init();

        // Si les actus n'ont jamais été checkées, on le fait
        if (!localStorage["PCiActusLastCheck"]) PCi.actus.check();

        // On gère les évènements de connexion / déconnexion
        window.PCiRT.Engine.AttachEvent('Actu', 'OnConnected', function (message) {
            PCi.tools.logMessage("WS : Utilisateur connecté");
        });

        window.PCiRT.Engine.AttachEvent('Actu', 'OnDisconnected', function (message) {
            PCi.tools.logMessage("WS : Utilisateur déconnecté");

            // Si l'utilisateur est déconnecté, on le reconnecte
            window.PCiRT.Services.Actu.Connect();
        });

        // Lorsqu'une nouvelle actualité arrive
        window.PCiRT.Engine.AttachEvent('Actu', 'OnMessage', function (message) {

            // On incrémente le compteur et on met à jour le badge + notification
            newActusCount.inc();
            updateBadgeAndNotify(JSON.parse(message.data), true);

            // Au bout de quelques minutes, on met à jour le cache d'actus
            setTimeout(PCi.actus.check, 3 * 60 * 1000);
        });

        // On lance la connexion
        window.PCiRT.Services.Actu.Connect();
    }

    // La fonction qui déclare les réponses aux requêtes qui peuvent être envoyées par le popup
    function ListenFromPopup() {

        chrome.extension.onRequest.addListener(
            function (request, sender, sendResponse) {
                switch (request.message) {
                    case "ask_news_cache":
                        sendResponse(JSON.parse(localStorage["PCiActusLastCheck"]));
                        break;

                    case "ask_user_cache":
                        sendResponse(JSON.parse(localStorage["PCiUserInfos"]));
                        break;

                    case "ask_forum_cache":
                        sendResponse(JSON.parse(localStorage["PCiForumLastCheck"]));
                        break;

                    case "ask_bp_cache":
                        sendResponse(JSON.parse(localStorage["PdNBonsPlansLastCheck"]));
                        break;

                    case "askEmploiCache":
                        sendResponse(JSON.parse(localStorage["PCiEmploiLastCheck"]));
                        break;

                    case "clearNewActusCount":
                        sessionStorage[newActusCount.localVarName] = 0;
                        updateBadgeAndNotify("", false);
                        break;

                    case "getNewActusCount":
                        sendResponse(newActusCount.get());
                        break;
                }
            });
    }

    // La fonction qui met en cache les informations des bons plans
    function UpdateBPCache() {
        PdN.getBonsPlans(function (listeBonsPlans) {
            localStorage["PdNBonsPlansLastCheck"] = JSON.stringify(listeBonsPlans);
        });
    }

    // La fonction qui met en cache les informations des bons plans
    function UpdateEmploiCache() {
        PCi.emploi.get(function (offres) {
            localStorage["PCiEmploiLastCheck"] = JSON.stringify(offres);
        });
    }

    // La fonction qui met en cache les informations du forum
    function UpdateForumCache() {

        // On récupère les infos du forum et on les enregistre dans le LS
        PCi.forum.get(function (infos) {

            // On déclare les variables utiles
            var oldInfos, newContent = false;

            // On récupère les anciennes infos si elles existent, sinon on utilise celles qui sont passées en paramètre
            if (!localStorage["PCiForumLastCheck"]) oldInfos = JSON.parse(localStorage["PCiForumLastCheck"]);
            else oldInfos = infos;

            // On stocke les infos passées en paramètre dans le LS pour une utilisation ultérieure
            localStorage["PCiForumLastCheck"] = JSON.stringify(infos);

            // Si les deux objets contiennent des infos sur les messages et les notifications
            if (oldInfos.messages && oldInfos.notifications && infos.messages && infos.notifications)
            {
                // S'il y a eu du changement dans les messages ou les notifications, on l'indique via isNews
                // On ne notifie que si le nombre est supérieur à l'ancien
                if (oldInfos.messages.count < infos.messages.count || oldInfos.notifications.count < infos.notifications.count) newContent = true;

                // Si l'on a récupéré des informations depuis le forum et que des messages sont présents, on lance une mise à jour du badge
                if (infos.messages && infos.notifications && (infos.messages.count > 0 || infos.notifications.count > 0))
                    updateBadgeAndNotify("", newContent);
            }
        });
    }

    // La fonction qui met en cache les informations de l'utilisateur
    function UpdateUserCache() {
        // On récupère les infos utilisateur et on les stocke dans le LS
        var userInfos = PCi.user.getInfos();
        localStorage["PCiUserInfos"] = JSON.stringify(userInfos);

        // Si l'utilisateur est Premium, on stocke le QR Code dans le LS
        if (userInfos.IsPremium) {
            PCi.tools.urlToLocalBlob(userInfos.PremiumInfo.UrlQr, function (data) {
                localStorage["qrCodeBlob"] = data;
            });
        }
        // Si l'utilisateur n'est pas Premium et qu'un QR Code est stocké, on l'efface
        else if (localStorage["qrCodeBlob"]) localStorage.removeItem("qrCodeBlob");
    }

    // La fonction qui gère la mise à jour du badge et les notifications
    function updateBadgeAndNotify(actu, sendNotif) {

        // On définit les variables utiles
        var appName = "PC INpact Toolkit for Chrome™";
        var colorRed = [255, 0, 0, 255];
        var colorGreen = [46, 139, 87, 255];
        var colorBlue = [31, 126, 170, 255];

        // On récupère le nombre de nouvelles actualités à lire
        var count = newActusCount.get();

        // S'il est positif et que l'on n'est pas dans la phase de 1st check
        // On met à jour le badge au niveau des actualités et on affiche les notifications
        if (count > 0) {
            set_badge(sessionStorage[newActusCount.localVarName], appName, colorRed);

            if (sendNotif && actu.Titre) notify_url("/html/notif.html?" + encodeURI(JSON.stringify(actu)));
        }
        // S'il n'y a pas de nouvelles actus, on regarde du côté du forum
        else {

            // On récupère les infos du forum dans le cache
            if (localStorage["PCiForumLastCheck"])
            {
                var forumInfos = JSON.parse(localStorage["PCiForumLastCheck"]);

                // S'il y a de nouveaux contenus, on met à jour le badge et on affiche des notifications
                if (forumInfos.messages && forumInfos.notifications && (forumInfos.messages.count > 0 || forumInfos.notifications.count > 0)) {

                    var forumNotificationText = "Vous avez de nouvelles notifications sur le forum";
                    set_badge("!", forumNotificationText, colorGreen);
                    if (sendNotif) notify_txt("", forumNotificationText, "");
                }
                // Sinon, on remet le badge dans son état initial
                else set_badge("", appName, colorBlue);
            }
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////

    // On lance la gestion de la recherche via l'Omnibox
    ChromeOmniListen();

    PCi.tools.logMessage("Configuration de l'Omnibox effectuée");

    // On met en place les listeners des requêtes en cas de login / logout
    // On sépare les deux parce que la méthodologie n'est pas la même
    chrome.webRequest.onResponseStarted.addListener(function () {
        UpdateUserCache();
        PCi.tools.logMessage("Connexion de l'utilisateur");
    }, {urls:["http://www.pcinpact.com/Account/ConnectLogOn*"]});

    chrome.webRequest.onBeforeRedirect.addListener(function () {
        UpdateUserCache();
        PCi.tools.logMessage("Déconnexion de l'utilisateur");
    }, {urls:["http://www.pcinpact.com/Account/LogOff*"]});

    PCi.tools.logMessage("Analyse des requêtes HTTP lancée");

    // Listener de l'installation ou de la mise à jour de l'extension
    chrome.runtime.onInstalled.addListener(function(details){
        switch (details.reson == "install")
        {
            case "install":
                localStorage.clear();
                notify_txt("", "", "L'installation de l'extension s'est bien déroulée");
                break;

            case "update":
                localStorage.clear();
                notify_txt("", "", "L'installation de la nouvelle version de l'extension s'est bien déroulée");
                break;
        }

        // On met à zéro les valeurs importantes
        setDefaultValues();

    });

    PCi.tools.logMessage("Analyse de la mise à jour / update lancée");

    // On lance la mise à jour des caches et les timers de répétition
    UpdateBPCache();
    setInterval(UpdateBPCache, 10 * 60 * 1000);

    PCi.tools.logMessage("Mise à jour des bons plans");

    UpdateEmploiCache();
    setInterval(UpdateEmploiCache, 10 * 60 * 1000);

    PCi.tools.logMessage("Mise à jour des offres d'emploi");

    UpdateForumCache();
    setInterval(UpdateForumCache, 60 * 1000);

    PCi.tools.logMessage("Mise à jour des informations du forum");

    UpdateUserCache();
    setInterval(UpdateUserCache, 10 * 60 * 1000);

    PCi.tools.logMessage("Mise à jour des informations utilisateur");

    // On lance la connexion au serveur Websocket
    websocketLaunch();

    PCi.tools.logMessage("Connexion au serveur Websocket effectuée");

    // On met en place la communication entre la page de background et le popup
    ListenFromPopup();

    PCi.tools.logMessage("Mise en place de la communication avec le popup");

})();