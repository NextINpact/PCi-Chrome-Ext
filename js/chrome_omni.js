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
   
// La fonction qui écoute l'Omnibox du navigateur
function ChromeOmniListen() {

    // On définit le texte par défaut
    chrome.omnibox.setDefaultSuggestion(
        {
            description:"Se rendre sur PC INpact.com"
        });

    // Lorsque l'utilisateur tape au clavier
    chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
        // On rajoute deux suggestions : l'une pour la recherche sur PCi, l'autre pour la recherche sur PdN
        // On renvoie le texte avec un indicateur du site demandé
        suggest([
            {
                content:"pci | " + text,
                description:"Rechercher une actualité sur PC INpact : " + text
            },
            {
                content:"pci_do | " + text,
                description:"Rechercher un dossier sur PC INpact : " + text
            },
            {
                content:"pci_te | " + text,
                description:"Rechercher un test sur PC INpact : " + text
            },
            {
                content:"pci_br | " + text,
                description:"Rechercher une brève sur PC INpact : " + text
            },
            {
                content:"pdn | " + text,
                description:"Rechercher sur Prix du Net : " + text
            }
        ]);
    });

    // Lorsque l'utilisateur valide sa requête
    chrome.omnibox.onInputEntered.addListener(function (text) {
        // S'il a demandé une recherche PCi ou PdN, on le redirige
        if (text.substring(0, 6) == "pdn | ")
            chrome.tabs.create(
                {
                    "url":"http://www.prixdunet.com/s/" + text.substring(6) + ".html"
                });
        else if (text.substring(0, 6) == "pci | ")
            chrome.tabs.create(
                {
                    "url":"http://www.pcinpact.com/recherche?_search=" + text.substring(6)
                });
        else if (text.substring(0, 9) == "pci_do | ")
            chrome.tabs.create(
                {
                    "url":"http://www.pcinpact.com/recherche?_search=" + text.substring(9) + "&_searchType=3"
                });
        else if (text.substring(0, 9) == "pci_te | ")
            chrome.tabs.create(
                {
                    "url":"http://www.pcinpact.com/recherche?_search=" + text.substring(9) + "&_searchType=2"
                });
        else if (text.substring(0, 9) == "pci_br | ")
            chrome.tabs.create(
                {
                    "url":"http://www.pcinpact.com/recherche?_search=" + text.substring(9) + "&_searchType=4"
                });
        // S'il y a une requête sans préfixe, on effectue une recherche sur PCi par défaut
        else if (text != '')
            chrome.tabs.create(
                {
                    "url":"http://www.pcinpact.com/recherche?_search=" + text
                });
        // Dans tous les autres cas (si le texte est vide), on le renvoie sur la home de PCi
        else
            chrome.tabs.create(
                {
                    "url":"http://www.pcinpact.com/"
                });
    });
}
