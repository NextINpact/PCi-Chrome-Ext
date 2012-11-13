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

function update_content_search(div) {

    empty_zone(div);

    var pci_opt = ["Actualités", "Commentaires", "Dossiers", "Emploi", "Tests", "INpactiens"];
    var pdn_opt = ["Actualités", "Bons plans", "Dossiers", "Produits", "Tests"];

    var appendPCiSearchBloc = function () {
        var pci_div = document.createElement("div");
        pci_div.className = "pciSearchBox";

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
        pdn_div.className = "pdnSearchBox";

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