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

function update_content_news(div, news, type) {

    var lastDate = "";

    empty_zone(div);

    var fillIn = function () {

        for (var key in news.List) {

            var blocDate = document.createElement("div");
            blocDate.innerText = news.List[key].PublishDate.date;
            blocDate.className = "alert alert-info bloc-date message_center";

            var blocActu = document.createElement("div");
            blocActu.className = "blocActu";

            var img = document.createElement("img");
            //img.src = "http://www.pcinpact.com/images/clair/categories/" + news.List[key].UrlIcone + ".png";
            img.src = news.List[key].DedicatedImgUrl;
            img.className = "actuIcone"

            var imgLink = document.createElement("a");
            //imgLink.href = "http://www.pcinpact.com/?f_rub=" + news.List[key].IdRubrique;
            imgLink.href = news.List[key].AbsoluteUrl;
            imgLink.target = "_blank";

            var titreLink = document.createElement("a");
            titreLink.href = news.List[key].AbsoluteUrl;
            titreLink.target = "_blank";
            if (news.List[key].IsBreve && type == "home") titreLink.innerHTML = "[Brève] " + news.List[key].Title;
            else titreLink.innerText = news.List[key].Title;
            titreLink.className = "titre";

            var imgFire = document.createElement("img");
            imgFire.src = "/pics/flamme16px.png";
            imgFire.title = "Les essentiels du jour"
            imgFire.align = "right";

            var commentBloc = document.createElement("span");
            commentBloc.className = "commentBloc";

            var commentsLink = document.createElement("a");
            commentsLink.className = "badge";

            if (news.List[key].NbComments > 0) commentsLink.className += " badge-info";
            commentsLink.target = "_blank";
            commentsLink.href = news.List[key].AbsoluteUrl + "?vc=1";
            commentsLink.innerText = news.List[key].NbComments;

            var dateBloc = document.createElement("p");
            dateBloc.className = "dateBloc";
            dateBloc.innerText = news.List[key].PublishDate.old_format.dateFromDotNet().toIlya() + " - ";

            var ssTitreBloc = document.createElement("span");
            ssTitreBloc.className = "ss_titre";
            ssTitreBloc.innerText = news.List[key].SubTitle + " ";

            //if (lastDate != news.List[key].PublishDate.date) div.appendChild(blocDate);
            lastDate = news.List[key].PublishDate.date;

            div.appendChild(blocActu);
            blocActu.appendChild(imgLink);
            imgLink.appendChild(img);
            blocActu.appendChild(titreLink);
            if (news.List[key].IsImportant) blocActu.appendChild(imgFire);
            //blocActu.appendChild(new_line);
            blocActu.appendChild(dateBloc);
            dateBloc.appendChild(ssTitreBloc);
            ssTitreBloc.appendChild(commentBloc);

            var getNewCommentsBloc = function(){

                var newCommentsLink = document.createElement("a");
                newCommentsLink.target = "_blank";
                newCommentsLink.href = news.List[key].LastCommentUrl;
                newCommentsLink.innerText = "+" + news.List[key].NbNewComments;
                commentBloc.appendChild(newCommentsLink);


                if (news.List[key].NbNewComments > 0 && news.List[key].NbNewComments != news.List[key].NbComments) {
                    newCommentsLink.className = "badge badge-important";
                }
                else if (news.List[key].NbNewComments == 0 && news.List[key].NbComments != 0) {
                    newCommentsLink.className = "badge badge-defaut";
                }

                return newCommentsLink;
            }

            if (news.List[key].LastCommentUrl != null && news.List[key].NbNewComments != undefined)
            {
                commentBloc.appendChild(getNewCommentsBloc());
                commentBloc.appendChild(document.createTextNode(" "));
            }

            commentBloc.appendChild(commentsLink);

            /*// On créé le bloc indiquant le nombre de partages sur les réseaux sociaux
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
    };

    var addEndBloc = function () {
        var endBloc = document.createElement("div");
        endBloc.className = "alert alert-info bloc-fin";
        endBloc.align = "center";
        endBloc.style.cursor = "pointer";
        switch (type) {
            case "actus":
                endBloc.innerText = "Accéder à toutes les actualités";
                endBloc.id = "all_actus";
                div.appendChild(endBloc);
                document.getElementById("all_actus").addEventListener("click", function () {
                    chrome.tabs.create({
                        "url":"http://www.pcinpact.com"
                    });
                }, false);
                break;
            case "breves":
                endBloc.innerText = "Accéder à toutoutes les brèves";
                endBloc.id = "all_breves";
                div.appendChild(endBloc);
                document.getElementById("all_breves").addEventListener("click", function () {
                    chrome.tabs.create({
                        "url":"http://www.pcinpact.com/toutes-les-breves.htm"
                    });
                }, false);
                break;
        }
    };

    fillIn();
    addEndBloc();

    setFooter("Dernière mise à jour : " + new Date(news.lastUpdateDate).toFR(true));
}
