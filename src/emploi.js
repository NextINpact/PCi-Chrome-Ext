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
            offre.className = "blocActu";

            var logo = document.createElement("img");
            logo.src = "http://www.pcinpact.com/images/common/remixJob/avatar-entreprise.jpg";
            logo.align = "left";
            logo.hspace = 5;
            logo.width = 75;
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
