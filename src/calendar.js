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