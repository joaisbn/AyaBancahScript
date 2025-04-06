// ==UserScript==
// @name         AYA Bancah Facilitar a Leitura em Tela Cheia no Computador
// @namespace    https://aya.app.br/
// @version      1.0
// @description  Aplica estilo customizado à página da AYA Bancah, para facilitar a leitura em computador
// @match        https://aya.app.br/ayabancah/minha-banca/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle(`
        html {
            zoom: 300%;
        }

        section {
            margin: 0;
            padding: 0;
        }

        .row {
            max-width: 100%;
        }

        .col-6.box-padding {
            width: 100%;
        }

        #contentfactory {
            margin-top: 0;
        }
    `);
})();
