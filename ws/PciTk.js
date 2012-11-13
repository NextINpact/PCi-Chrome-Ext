/**********************************************************************************************************
Copyright (C) 2012  Pierre-Alain David - www.pcinpact.com - PC INpact SARL 

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

/!\ TO BE REMOVED, PLEASE USE PCiRT.js /!\

/***********************************************************************************************************/
(function () {
    var PciTk = {
        Init: function (userName, password) {
            if (userName === undefined)
                userName = '';
            if (password == undefined)
                password = '';

            PciTk.Engine.CheckBrowserCap();
            PciTk.Engine.UserName = userName;
            if (password != '') {
                var hashedPassword = CryptoJS.MD5(password);
                hashedPassword = hashedPassword.toString();
            } else {
                hashedPassword = '';
            }
            PciTk.Engine.HashedPassword = hashedPassword;
            PciTk.Engine.IsInitialized = true;
            var autObj = window.localStorage['authObj'];
            try {
                PciTk.Engine.AuthObject = JSON.parse(autObj);
            }
            catch (e) {
                PciTk.Engine.AuthObject = undefined;
            }
            //nettoyer le websocket si la page se ferme
            window.addEventListener("beforeunload", function (e) {
                PciTk.WsClient.Disconnect();
            });
        },
        Engine: {
            Socket: null,
            LastReceivedMessage: null,
            IsInitialized: false,
            UserName: "",
            HashedPassword: "",
            AuthObject: null,
            EnsureInitialized: function () {
                var initedReal = (!((!PciTk.Engine.IsInitialized || PciTk.Engine.UserName === "" || PciTk.Engine.HashedPassword === "") && (PciTk.Engine.AuthObject === undefined)));
                return initedReal;
            },
            CheckBrowserCap: function () {
                if (!window.localStorage || !WebSocket)
                    throw ("Votre navigateur supporte mal HTML5, et ne peut utiliser ce service.");
            }
        },
        WsClient: {
            IsConnected: false,
            Connect: function () {
                if (!PciTk.Engine.EnsureInitialized()) {
                    PciTk.WsClient.InvokeEvent('OnAuthFailed', 'Base', "Session introuvable ou Toolkit non initialisé");
                    return;
                }
                if (PciTk.WsClient.IsConnected) {
                    PciTk.WsClient.InvokeEvent('OnAuthFailed', 'Base', "Le toolkit est déjà connecté.");
                    return;
                }
                if (!PciTk.WsClient.IsConnected) {
                    if (PciTk.Engine.Socket != null) {
                        PciTk.Engine.Socket.close();
                        PciTk.Engine.Socket = null;
                    }
                    PciTk.Engine.Socket = new WebSocket(PciTk.Config.WebSocket.GetFullHost() + PciTk.Config.ServiceEntryPoint);
                    PciTk.Engine.Socket.onclose = PciTk.Config.WebSocket.ReceiveHandlers.ConnectionClose;
                    PciTk.Engine.Socket.onmessage = PciTk.Config.WebSocket.ReceiveHandlers.AuthChallenge;
                    setTimeout(function () {
                        //deux auth possible, par challenge 4way et par token privé
                        var firstHs = {};
                        if (PciTk.Engine.AuthObject == null) {
                            //4way                        
                            firstHs.Username = PciTk.Engine.UserName;
                            firstHs.Method = "Handshake";
                        } else {
                            //par token
                            firstHs.Id = PciTk.Engine.AuthObject.Id;
                            firstHs.PublicToken = PciTk.Engine.AuthObject.Key;
                            firstHs.Method = "Token";
                        }
                        PciTk.Engine.Socket.send(JSON.stringify(firstHs));
                    }, 3000);

                }
            },
            Disconnect: function () {
                if (PciTk.WsClient.IsConnected) {
                    PciTk.Engine.Socket.close();
                    PciTk.Engine.Socket = null;
                    PciTk.WsClient.IsConnected = false;
                }
            },

            SendRequest: function (subscribeObject) {
                if (!PciTk.WsClient.IsConnected)
                    throw 'La connection avec le serveur distant est fermée.';

                var strObject = JSON.stringify(subscribeObject);
                PciTk.Engine.Socket.send(strObject);
            },
            UpdateSubscription: function (subscribeObject) {
                subscribeObject.Method = "update";
                PciTk.WsClient.SendRequest(subscribeObject);
                return sobj;
            },
            SubscribeToComment: function (idsNews) {
                var sobj = new PciTk.Objects.SubscribeObject("Comment", idsNews, "subscribe");
                PciTk.WsClient.SendRequest(sobj);
                return sobj;
            },
            SubscribeToNews: function () {
                var sobj = new PciTk.Objects.SubscribeObject("Actu", null, "subscribe");
                PciTk.WsClient.SendRequest(sobj);
                return sobj;
            },
            InvokeEvent: function (eventName, method, message) {
                if (typeof PciTk.WsClient.AttachedEvents[eventName] === "function")
                    PciTk.WsClient.AttachedEvents[eventName](method, message);
            },
            AttachEvent: function (eventName, fn) {
                if (PciTk.WsClient.ValidEvents.indexOf(eventName) == -1)
                    throw (eventName + ' n\'est pas un event valide');
                if (typeof fn != 'function') 
                    throw ('fn doit être une fonction valide');
                PciTk.WsClient.AttachedEvents[eventName] = fn;
            },         
            ValidEvents: ['OnConnected', 'OnDisconnected', 'OnMessage', 'OnAuthFailed'],
            AttachedEvents: {}    
        },
        Crypto: {
            asciiToByteArray: function (s) {
                var r = Array(s.length);
                for (var i = 0; i < s.length; i++) {
                    r[i] = s.charCodeAt(i);
                }
                return r;
            },
            byteArrayToAscii: function (a) {
                var r = "";
                for (var i = 0; i < a.length; i++) {
                    r += String.fromCharCode(a[i]);
                }
                return r;
            },
            hexStringToByteArray: function (s) {
                try {
                    hexcase
                } catch (e) {
                    hexcase = 0;
                }
                var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
                var r = Array(s.length / 2);
                for (var i = 0; i < s.length; i += 2) {
                    r[i / 2] = parseInt(s.substr(i, 2), 16);
                }
                return r;
            },
            byteArrayToHexString: function (a) {
                try {
                    hexcase
                } catch (e) {
                    hexcase = 0;
                }
                var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
                var r = "";
                for (var i = 0; i < a.length; i++) {
                    var b = hex_tab.charAt((a[i] >> 4) & 0x0F) +
                        hex_tab.charAt(a[i] & 0x0F);
                    r += b;
                }
                return r;
            }
        },
        Config: {
            WebSocket:
                {
                    Domain: "",
                    Port: 80,
                    GetFullHost: function () {
                        return "ws://" + PciTk.Config.WebSocket.Domain + ":" + PciTk.Config.WebSocket.Port + "/";
                    },
                    ReceiveHandlers: {
                        AuthChallenge: function (message) {
                            var responseObject = JSON.parse(message.data);
                            PciTk.Engine.Socket.LastReceivedMessage = responseObject;
                            var method = responseObject.Method;
                            switch (method) {
                                case "Challenge":
                                    window.localStorage.removeItem('authObj');
                                    var text = responseObject.EncryptedChallenge;
                                    var bytes = cryptoHelpers.base64.decode(text);
                                    bytes.pop();
                                    var byteKey = PciTk.Crypto.asciiToByteArray(PciTk.Engine.HashedPassword);
                                    var commonIv = cryptoHelpers.base64.decode(responseObject.IV);
                                    var decrypted = slowAES.decrypt(bytes, slowAES.modeOfOperation.CBC, byteKey, commonIv);
                                    decrypted = PciTk.Crypto.byteArrayToAscii(decrypted);
                                    var autResponseChallenge = { EncryptedChallenge: text, RawChallenge: decrypted };
                                    PciTk.Engine.Socket.send(JSON.stringify(autResponseChallenge));
                                    break;
                                case "Accept":
                                    //Le serveur  indique que le challenge est relevé, changement des events du websocket
                                    PciTk.Engine.Socket.onmessage = PciTk.Config.WebSocket.ReceiveHandlers.Consume;
                                    var authObj = { Id: responseObject.Id, Login: responseObject.UserName, Key: responseObject.AuthKey };
                                    authObj = JSON.stringify(authObj);
                                    window.localStorage['authObj'] = authObj;
                                    PciTk.Engine.AuthObject = authObj;
                                    PciTk.WsClient.IsConnected = true;
                                    //lever l'evement de connection
                                    PciTk.WsClient.InvokeEvent('OnConnected', null, null);
                                    break;
                                case "DenyToken":
                                    window.localStorage.removeItem('authObj');
                                    PciTk.Engine.AuthObject = null;
                                case "DenyHandshake":
                                    PciTk.WsClient.InvokeEvent('OnAuthFailed', method, responseObject.Motd);      
                                    break;
                            }
                        },
                        Consume: function (message) {
                            var jsonData = JSON.parse(message.data);
                            PciTk.Engine.Socket.LastReceivedMessage = jsonData;
                            PciTk.WsClient.InvokeEvent('OnMessage', null, jsonData);
        
                        },
                        ConnectionClose: function () {
                            PciTk.WsClient.IsConnected = false;
                            PciTk.WsClient.InvokeEvent('OnDisconnected', null, null);
                        }
                    }

                },
            ServiceEntryPoint: "Handlers/PCiWs.ashx"
        },
        Objects: {
            SubscribeObject: function (channel, subArguments, method) {
                this.Method = method;
                this.SubscriptionRequest = channel;
                this.Args = subArguments;
                return this;
            }
        }

    };

    window.PciTk = window.PciTk || PciTk;
})()