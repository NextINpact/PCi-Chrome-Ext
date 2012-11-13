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

function update_content_bp(div, bp_infos) {

    var appendBonPlanBloc = function (item) {
        var bp = document.createElement("div");
        bp.className = "blocActu";

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
