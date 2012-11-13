/**********************************************************************************************************
Copyright (C) 2012  Pierre-Alain David - http://www.pcinpact.com - PC INpact SARL 

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
***********************************************************************************************************/
(function (window) {
    window.PCiRT = {
        Init: function () {
            //nettoyer les services si la page se ferme
            window.addEventListener("beforeunload", function (e) {
                PCiRT.Engine.WipeAllServices();
            });
        },
        Engine: {

            CheckBrowserCap: function () {
                if (!window.localStorage || !WebSocket)
                    throw ("Votre navigateur supporte mal HTML5, et ne peut utiliser ce service.");
            },
            InvokeEvent: function (subscription, eventName, message) {
                if (typeof PCiRT.Services[subscription].AttachedEvents[eventName] === "function")
                    PCiRT.Services[subscription].AttachedEvents[eventName](message);
            },
            AttachEvent: function (subscription, eventName, fn) {
                if (PCiRT.Engine.ValidEvents.indexOf(eventName) == -1)
                    throw (eventName + ' n\'est pas un event valide');
                if (typeof fn != 'function')
                    throw ('fn doit être une fonction valide');
                PCiRT.Services[subscription].AttachedEvents[eventName] = fn;
            },
            ValidEvents: ['OnConnected', 'OnDisconnected', 'OnMessage'],

            Config: {
                RootDomain: "argos.pcinpact.com",
                RootPort: 80,
                GetWsHost: function () {
                    return "ws://" + PCiRT.Engine.Config.RootDomain + ":" + PCiRT.Engine.Config.RootPort + "/";
                }
            },
            WipeAllServices: function () {
                for (var x in PCiRT.Services) {
                    var currentService = PCiRT.Services[x];
                    currentService.Disconnect();
                }
            },

        },
        Services: {

            Actu: {
                IsConnected: false,
                Name: "Actu",
                EntryPoint: "Handlers/Actu.ashx",
                Socket: null,
                Connect: function () {
                    if (!PCiRT.Services.Actu.IsConnected) {
                        PCiRT.Services.Actu.Socket = new WebSocket(PCiRT.Engine.Config.GetWsHost() + PCiRT.Services.Actu.EntryPoint);
                        PCiRT.Services.Actu.Socket.onclose = PCiRT.Services.Actu.Handlers.ConnectionClose;
                        PCiRT.Services.Actu.Socket.onmessage = PCiRT.Services.Actu.Handlers.MessageReceived;
                    }

                },
                Disconnect: function () {
                    if (PCiRT.Services.Actu.IsConnected) {
                        PCiRT.Services.Actu.Socket.close();
                        PCiRT.Services.Actu.Socket = null;

                    }
                },
                AttachedEvents: {},
                OnConnected: null,
                OnDisconnected: null,
                Handlers: {
                    ConnectionAcquired: function () {
                        PCiRT.Services.Actu.IsConnected = true;
                        PCiRT.Engine.InvokeEvent("Actu", "OnConnected", null);
                    },
                    ConnectionClose: function (e) {
                        PCiRT.Services.Actu.IsConnected = false;
                        PCiRT.Engine.InvokeEvent("Actu", "OnDisconnected", e);

                    },
                    MessageReceived: function (message) {
                        PCiRT.Engine.InvokeEvent("Actu", "OnMessage", message);
                    }
                }
            },


        }
    };

})(window);