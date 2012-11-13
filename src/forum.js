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
