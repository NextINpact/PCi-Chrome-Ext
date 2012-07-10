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

// La fonction qui permet de mettre à jour le badge
function set_badge(text, title, color)
{
    chrome.browserAction.setBadgeText(
        {
            text : text
        });
    chrome.browserAction.setBadgeBackgroundColor(
        {
            color : color
        });
    chrome.browserAction.setTitle(
        {
            title : title
        });
}

//Une fonction qui gère les notifications via TXT
function notify_txt(icon, title, body)
{
    // Si l'utilisateur a demandé à ne pas avoir de notifications, on part
    if(localStorage["notifCkeck"] != 1)
        return;

    // On affiche la notification
    var notification = webkitNotifications.createNotification(icon, title, body);
    notification.show();

    // On attend le temps indiqué avant de fermer la notification
    setTimeout(function()
    {
        notification.cancel();
    }, localStorage["notifDelay"] * 1000);
}

//Une fonction qui gère les notifications via URL
function notify_url(url)
{
    // Si l'utilisateur a demandé à ne pas avoir de notifications, on part
    if(localStorage["notifCheck"] != 1)
        return;

    // On affiche la notification
    var notification = webkitNotifications.createHTMLNotification(url);
    notification.show();

    // On attend le temps indiqué avant de fermer la notification
    setTimeout(function()
    {
        notification.cancel();
    }, localStorage["notifDelay"] * 1000);
}
