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
            deco_x.style.float = "right";
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

// La fonction qui gère l'affichage du footer
function setFooter(text) {

    var footer = document.getElementById("footer");

    footer.innerText = text;
    footer.style.display = (text === "") ? "none" : "block";
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

function update_content_bp(div, bp_infos) {

    var appendBonPlanBloc = function (item) {
        var bp = document.createElement("div");
        bp.className = "bloc_actu";

        var bp_titre = document.createElement("div");
        var bp_link = document.createElement("a");
        bp_link.target = "_blank";
        bp_link.href = item.url;
        bp_link.innerText = item.titre;

        var bp_date = document.createElement("div");
        bp_date.innerText = item.date;
        bp_date.className = "ss_titre";
        var logo = document.createElement("img");
        logo.src = item.categorie.img;
        logo.align = "left";
        logo.hspace = 5;

        div.appendChild(bp);

        bp.appendChild(logo);
        bp.appendChild(bp_titre);
        bp_titre.appendChild(bp_link);
        bp.appendChild(bp_date);
    };

    empty_zone(div);

    var head = document.createElement("div");
    head.innerText = "Les 10 bons plans les plus populaires du moment";
    head.className = "alert alert-info bloc-date";

    div.appendChild(head);

    for (var key in bp_infos.list) appendBonPlanBloc(bp_infos.list[key]);
    var bloc_all = document.createElement("div");
    bloc_all.className = "alert alert-info bloc-fin";
    bloc_all.align = "center";
    bloc_all.style.cursor = "pointer";
    bloc_all.innerText = "Accéder à tous les bons plans";
    bloc_all.id = "all_bp";
    div.appendChild(bloc_all);

    document.getElementById("all_bp").addEventListener("click", function () {
        chrome.tabs.create({
            "url":"http://www.prixdunet.com/bon-plan.html?page=1&type=0&motcle=&order=nb_lectures&waypopu=desc"
        });
    }, false);

    setFooter("Dernière mise à jour : " + new Date(bp_infos.lastUpdateDate).toFR(true));

}

// La fonction qui gère l'affichage du calendrier
function update_content_cal(div) {

    // On vide la zone
    empty_zone(div);

    // On définit l'URL du calendrier à utiliser
    var cal_url = "https://www.google.com/calendar/embed?hl=fr&showPrint=0&height=600&wkst=1&bgcolor=%23FFFFFF&src=s8g7dr50a615kbi8cmm58ojv9k%40group.calendar.google.com&color=%23853104&src=ffpfmo9cpe4ldlb6l36dugq9t0%40group.calendar.google.com&color=%23182C57&ctz=Europe%2FParis";

    // On intègre l'iFrame
    var cal_iframe = document.createElement("iframe");
    cal_iframe.style.borderWidth = 0;
    cal_iframe.src = cal_url;
    cal_iframe.width = 650;
    cal_iframe.height = 440;
    cal_iframe.frameBorder = 0;
    cal_iframe.scrolling = "no";
    cal_iframe.innerText = "";
    div.appendChild(cal_iframe);

}

// La fonction qui gère la zone dédié aux emplois
function update_content_emploi(div, data) {

    // On vide la zone
    empty_zone(div);

    // On récupères les infos utile depuis l'objet
    var offres = data.list, lastUpdate = data.lastUpdateDate;

    // Si aucune offre n'est détectée, on affiche un message spécifique
    if (offres.length === 0) {
        var message = document.createElement("p");
        message.innerText = "Aucune offre d'emploi n'a été trouvée. Un problème ? Retrouvez les ";
        message.className = "alert alert-error message_center";

        var link = document.createElement("a");
        link.innerText = "sur notre site";
        link.href = "http://www.pcinpact.com/emploi/";
        link.target = "_blank";

        var point = document.createTextNode(".");

        div.appendChild(message);
        message.appendChild(link);
        message.appendChild(point);
    }
    // Si l'on détecte des offres d'emploi, on affiche un bloc pour chacune d'elle
    else {
        for (var i = 0; i < offres.length; i++) {
            var offre = document.createElement("div");
            offre.className = "bloc_actu";

            var logo = document.createElement("img");
            logo.src = "http://www.pcinpact.com/images/common/remixJob/avatar-entreprise.jpg";
            logo.align = "left";
            logo.hspace = 5;
            logo.width = 50;
            logo.style = "border:1px solid black";

            var offre_link = document.createElement("a");
            offre_link.href = offres[i].url;
            offre_link.innerText = offres[i].title;
            offre_link.target = "_blank";

            var ss_titre = document.createElement("div");
            ss_titre.className = "ss_titre";
            ss_titre.innerText = offres[i].description;

            div.appendChild(offre);
            offre.appendChild(logo);
            offre.appendChild(offre_link);
            offre.appendChild(ss_titre);

        }

        var bloc_all = document.createElement("div");
        bloc_all.className = "alert alert-info bloc-fin";
        bloc_all.align = "center";
        bloc_all.style.cursor = "pointer";
        bloc_all.innerText = "Accéder à toutes les offres d'emploi";
        bloc_all.id = "all_offres";
        div.appendChild(bloc_all);

        document.getElementById("all_offres").addEventListener("click", function () {
            chrome.tabs.create({
                "url":"http://www.pcinpact.com/emploi"
            });
        }, false);
    }

    // On met en place le footer
    setFooter("Dernière mise à jour : " + new Date(lastUpdate).toFR(true));

    // On place le focus, cela permet de résoudre le problème de hauteur de la zone
    document.getElementById("messageZone").focus();
}

function update_content_forum(div, forumInfos) {

    empty_zone(div);

    var appendForumInfos = function () {

        var m_zone = document.createElement("div");

        // Si l'utilisateur est connecté on affiche ses informations
        if (forumInfos.isLoggedIn) {

            // Si l'utilisateur n'est pas connecté, on affiche un message d'erreur
            m_zone.style.fontWeight = "bold";
            m_zone.className = "well message_center black_link";

            var m_link = document.createElement("a");
            var n_link = document.createElement("a");

            m_link.href = forumInfos.messages.url;
            n_link.href = forumInfos.notifications.url;
            m_link.innerText = (forumInfos.messages.count > 1) ? forumInfos.messages.count + " nouveaux messages" : forumInfos.messages.count + " nouveau message";
            n_link.innerText = (forumInfos.notifications.count > 1) ? forumInfos.notifications.count + " notifications" : forumInfos.notifications.count + " notification";
            m_link.target = n_link.target = "_blank";

            m_zone.appendChild(m_link);
            m_zone.appendChild(n_link);

            var part_1 = document.createTextNode("Vous avez ");
            var part_2 = document.createTextNode(" et ");

            m_link.parentNode.insertBefore(part_1, m_link);
            n_link.parentNode.insertBefore(part_2, n_link);
        }
        else {
            m_zone.innerText = "Vous n'êtes pas connecté sur ";
            m_zone.className = "alert alert-error message_center";

            var forum_link = document.createElement("a");
            forum_link.href = "http://forum.pcinpact.com/index.php?app=core&module=global&section=login";
            forum_link.target = "_blank";
            forum_link.innerText = "le forum";

            m_zone.appendChild(forum_link);
        }

        return m_zone;
    };

    var appendGagnantInfos = function () {
        var g_zone = document.createElement("div");
        g_zone.style.fontWeight = "bold";
        g_zone.className = "alert alert-info message_center";
        g_zone.innerText = "Le gagnant du t-shirt du jour est : ";

        var g_link = document.createElement("a");
        g_link.href = forumInfos.gagnant.url;
        g_link.innerText = forumInfos.gagnant.name;

        g_zone.appendChild(g_link);
        return g_zone;
    };

    div.appendChild(appendForumInfos());
    div.appendChild(appendGagnantInfos());
}

function update_content_news(div, news, type) {

    var last_date = "";

    empty_zone(div);

    for (var key in news.List) {
        if (type == "home" || (news.List[key].IsBreve && type == "breves") || (!news.List[key].IsBreve && type == "actus")) {

            var new_line = document.createElement("br");

            var bloc_date = document.createElement("div");
            bloc_date.innerText = news.List[key].PublishDate.date;
            bloc_date.className = "alert alert-info bloc-date message_center";

            var bloc_actu = document.createElement("div");
            bloc_actu.className = "bloc_actu";

            var img = document.createElement("img");
            //img.src = "http://www.pcinpact.com/images/clair/categories/" + news.List[key].UrlIcone + ".png";
            img.src = news.List[key].DedicatedImgUrl;
            img.height = 40;
            img.align = "left";
            img.className = "actuIcone"

            var img_link = document.createElement("a");
            //img_link.href = "http://www.pcinpact.com/?f_rub=" + news.List[key].IdRubrique;
            img_link.href = news.List[key].AbsoluteUrl;
            img_link.target = "_blank";

            var news_link = document.createElement("a");
            news_link.href = news.List[key].AbsoluteUrl;
            news_link.target = "_blank";
            if (news.List[key].IsBreve && type == "home") news_link.innerHTML = "[Brève] " + news.List[key].Title;
            else news_link.innerText = news.List[key].Title;
            
            var img_fire = document.createElement("img");
            img_fire.src = "/pics/flamme16px.png";
            img_fire.title = "Les essentiels du jour"
            img_fire.align = "right";
            
            var comment_bloc = document.createElement("span");
            comment_bloc.className = "comment_bloc";

            var comment_link = document.createElement("a");
            comment_link.className = "badge";
            if (news.List[key].NbComments > 0) comment_link.className += " badge-info";
            comment_link.target = "_blank";
            comment_link.href = news.List[key].AbsoluteUrl + "?vc=1";
            comment_link.innerText = news.List[key].NbComments;

            var ss_bloc = document.createElement("span");
            ss_bloc.className = "ss_titre";
            ss_bloc.innerText = news.List[key].PublishDate.time + " - " + news.List[key].SubTitle + " ";

            if (last_date != news.List[key].PublishDate.date) div.appendChild(bloc_date);
            last_date = news.List[key].PublishDate.date;

            div.appendChild(bloc_actu);

            bloc_actu.appendChild(img_link);
            img_link.appendChild(img);
            bloc_actu.appendChild(news_link);
            if (news.List[key].IsImportant) bloc_actu.appendChild(img_fire);
            bloc_actu.appendChild(new_line);
            bloc_actu.appendChild(ss_bloc);
            ss_bloc.appendChild(comment_bloc);
            comment_bloc.appendChild(comment_link);

            if (news.List[key].LastCommentUrl != null && news.List[key].NbNewComments != undefined && news.List[key].NbNewComments > 0 && news.List[key].NbNewComments != news.List[key].NbComments) {
                var new_comment_link = document.createElement("a");
                new_comment_link.className = "badge badge-important";
                new_comment_link.target = "_blank";
                new_comment_link.href = news.List[key].LastCommentUrl;
                new_comment_link.innerText = "+" + news.List[key].NbNewComments;
                comment_bloc.appendChild(new_comment_link);
                comment_bloc.appendChild(document.createTextNode(" "));
            }

            else if (news.List[key].LastCommentUrl != null && news.List[key].NbNewComments != undefined && news.List[key].NbNewComments == 0 && news.List[key].NbComments != 0) {
                var new_comment_link = document.createElement("a");
                new_comment_link.className = "badge badge-defaut";
                new_comment_link.target = "_blank";
                new_comment_link.href = news.List[key].LastCommentUrl;
                new_comment_link.innerText = "+" + news.List[key].NbNewComments;
                comment_bloc.appendChild(new_comment_link);
                comment_bloc.appendChild(document.createTextNode(" "));
            }
            
            comment_bloc.appendChild(comment_link);

        /*            // On créé le bloc indiquant le nombre de partages sur les réseaux sociaux
             var social_bloc = document.createElement("span");
             social_bloc.className = "label label-success";
             social_bloc.innerText = news.List[key].socialCount.total;

             // On définit l'info-bulle qui donne des détails sur le partage sur chaque réseau
             var socialInfoArray = new Array ("Partages Facebook :", news.List[key].socialCount.facebook, "-",
             "Partages Twitter :", news.List[key].socialCount.twitter);
             social_bloc.title = socialInfoArray.join(" ");

             // On rajoute un espace et le bloc dédié aux réseaux sociaux
             comment_bloc.appendChild(document.createTextNode(" "));
             comment_bloc.appendChild(social_bloc);*/
        }
    }

    var bloc_all = document.createElement("div");
    bloc_all.className = "alert alert-info bloc-fin";
    bloc_all.align = "center";
    bloc_all.style.cursor = "pointer";

    switch (type) {
        case "actus":
            bloc_all.innerText = "Accéder à toutes les actualités";
            bloc_all.id = "all_actus";
            div.appendChild(bloc_all);
            document.getElementById("all_actus").addEventListener("click", function () {
                chrome.tabs.create({
                    "url":"http://www.pcinpact.com"
                });
            }, false);
            break;

        case "breves":
            bloc_all.innerText = "Accéder à toutoutes les brèves";
            bloc_all.id = "all_breves";
            div.appendChild(bloc_all);

            document.getElementById("all_breves").addEventListener("click", function () {
                chrome.tabs.create({
                    "url":"http://www.pcinpact.com/toutes-les-breves.htm"
                });
            }, false);
            break;
    }

    setFooter("Dernière mise à jour : " + new Date(news.lastUpdateDate).toFR(true));
}

function update_content_premium(div, user) {

    empty_zone(div);

    if (user.IsPremium) {
        var list = document.createElement("div");

        var pr_url_div = document.createElement("div");

        var pr_url_txt = document.createElement("h3");
        pr_url_txt.innerText = "URL Premium :";

        var pr_url = document.createElement("div");
        pr_url.className = "well message_center black_link cutIfTooLong";
        var pr_url_link = document.createElement("a");
        pr_url_link.innerText = user.PremiumInfo.UrlRss;
        pr_url_link.href = user.PremiumInfo.UrlRss;
        pr_url_link.target = "_blank";

        var pr_qr_div = document.createElement("div");
        var pr_qr_txt = document.createElement("h3");
        pr_qr_txt.innerText = "QR Code Premium :";

        var pr_qr = document.createElement("div");
        var pr_qr_img = document.createElement("img");
        if (localStorage["qrCodeBlob"]) pr_qr_img.src = localStorage["qrCodeBlob"];
        else pr_qr_img.src = user.PremiumInfo.UrlQr;
        pr_qr_img.alt = "QR Code";
        pr_qr.className = "well message_center";

        var pr_date = document.createElement("div");
        pr_date.innerText = "Date d'expiration de votre compte : " + user.PremiumInfo.Expiration.dateFromDotNet().toFR(true);
        pr_date.className = "alert alert-info message_center";
        pr_date.style.fontWeight = "bold";

        div.appendChild(list);

        list.appendChild(pr_url_div);
        pr_url_div.appendChild(pr_url_txt);
        pr_url_div.appendChild(pr_url);
        pr_url.appendChild(pr_url_link);

        list.appendChild(pr_qr_div);
        pr_qr_div.appendChild(pr_qr_txt);
        pr_qr_div.appendChild(pr_qr);
        pr_qr.appendChild(pr_qr_img);

        list.appendChild(pr_date);

    }
    else {
        localStorage["lastRub"] = "home";
        fill_in_container(localStorage["lastRub"]);
    }

}

function update_content_search(div) {

    empty_zone(div);

    var pci_opt = ["Actualités", "Commentaires", "Dossiers", "Emploi", "Tests", "INpactiens"];
    var pdn_opt = ["Actualités", "Bons plans", "Dossiers", "Produits", "Tests"];

    var appendPCiSearchBloc = function () {
        var pci_div = document.createElement("div");
        pci_div.style.width = "320px";
        pci_div.style.float = "left";

        var pci_titre = document.createElement("h3");
        pci_titre.innerText = "PC INact :";

        var pci_form = document.createElement("form");
        pci_form.className = "well form-search";

        var pci_div_append_btn = document.createElement("div");
        pci_div_append_btn.className = "input-append";

        var pci_input = document.createElement("input");
        pci_input.type = "text";
        pci_input.className = "search-query input-medium";
        pci_input.id = "search_pci_v";
        pci_input.placeholder = "Rechercher sur PCi...";

        var pci_btn = document.createElement("button");
        pci_btn.type = "submit";
        pci_btn.className = "btn";
        pci_btn.id = "search_pci";
        pci_btn.innerText = "OK";

        var pci_div_s = document.createElement("div");
        pci_div_s.style.marginTop = "10px";
        pci_div_s.style.marginLeft = "0px";

        var pci_select = document.createElement("select");
        pci_select.id = "search_pci_s";

        div.appendChild(pci_div);
        pci_div.appendChild(pci_titre);
        pci_div.appendChild(pci_form);
        pci_form.appendChild(pci_div_append_btn);
        pci_div_append_btn.appendChild(pci_input);
        pci_div_append_btn.appendChild(pci_btn);
        pci_form.appendChild(pci_div_s);
        pci_div_s.appendChild(pci_select);

        for (var i = 0; i < pci_opt.length; i++) {
            var element = document.createElement("option");
            element.innerText = pci_opt[i];
            pci_select.appendChild(element);
        }
    };

    var appendPdNSearchBloc = function () {
        var pdn_div = document.createElement("div");
        pdn_div.style.width = "320px";
        pdn_div.style.float = "right";

        var pdn_titre = document.createElement("h3");
        pdn_titre.innerText = "Prix du Net :";

        var pdn_form = document.createElement("form");
        pdn_form.className = "well form-search";

        var pdn_div_append_btn = document.createElement("div");
        pdn_div_append_btn.className = "input-append";

        var pdn_input = document.createElement("input");
        pdn_input.type = "text";
        pdn_input.className = "search-query input-medium";
        pdn_input.id = "search_pdn_v";
        pdn_input.placeholder = "Rechercher sur PdN...";

        var pdn_btn = document.createElement("button");
        pdn_btn.type = "submit";
        pdn_btn.className = "btn";
        pdn_btn.id = "search_pdn";
        pdn_btn.innerText = "OK";

        var pdn_div_s = document.createElement("div");
        pdn_div_s.style.marginTop = "10px";
        pdn_div_s.style.marginLeft = "0px";

        var pdn_select = document.createElement("select");
        pdn_select.id = "search_pdn_s";

        div.appendChild(pdn_div);
        pdn_div.appendChild(pdn_titre);
        pdn_div.appendChild(pdn_form);
        pdn_form.appendChild(pdn_div_append_btn);
        pdn_div_append_btn.appendChild(pdn_input);
        pdn_div_append_btn.appendChild(pdn_btn);
        pdn_form.appendChild(pdn_div_s);
        pdn_div_s.appendChild(pdn_select);

        for (var i = 0; i < pdn_opt.length; i++) {
            var element = document.createElement("option");
            element.innerText = pdn_opt[i];
            if (pdn_opt[i] == "Produits") element.selected = "selected";
            pdn_select.appendChild(element);
        }
    };

    appendPCiSearchBloc();
    appendPdNSearchBloc();

    var enablePCiSearchClickButton = function () {
        document.getElementById("search_pci").addEventListener("click", function () {
            var url_s_pci = "http://www.pcinpact.com/recherche?_search=" + document.getElementById("search_pci_v").value + "&_searchType=";
            var url_se_pci = "http://www.pcinpact.com/emploi?_page=1&terme=" + document.getElementById("search_pci_v").value;

            switch (document.getElementById("search_pci_s").value) {
                case "Actualités":
                    url_s_pci += "1";
                    break;
                case "Commentaires":
                    url_s_pci += "6";
                    break;
                case "Dossiers":
                    url_s_pci += "3";
                    break;
                case "Emploi":
                    url_s_pci = url_se_pci;
                    break;
                case "Tests":
                    url_s_pci += "2";
                    break;
                case "INpactiens":
                    url_s_pci += "5";
                    break;
            }
            chrome.tabs.create({
                "url":url_s_pci
            });
        }, false);
    };

    var enablePdNSearchClickButton = function () {
        document.getElementById("search_pdn").addEventListener("click", function () {
            var url_s_pdn = "http://www.prixdunet.com/s/" + document.getElementById("search_pdn_v").value + ".html";
            switch (document.getElementById("search_pdn_s").value) {
                case "Actualités":
                    url_s_pdn += "?type=actu";
                    break;
                case "Bons plans":
                    url_s_pdn = "http://www.prixdunet.com/bon-plan.html?motcle=" + document.getElementById("search_pdn_v").value + "&order=nb_lectures&waypopu=desc";
                    break;
                case "Dossiers":
                    url_s_pdn += "?type=dossier";
                    break;
                case "Tests":
                    url_s_pdn += "?type=test";
                    break;
            }
            chrome.tabs.create({
                "url":url_s_pdn
            });
        }, false);
    };

    enablePCiSearchClickButton();
    enablePdNSearchClickButton();

    // On place le focus sur le champ de recherche de PCi
    // Cela permet de résoudre le problème de hauteur de la zone
    document.getElementById("search_pci_v").focus();
}