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
