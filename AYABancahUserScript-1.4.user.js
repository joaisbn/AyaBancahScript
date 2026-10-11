// ==UserScript==
// @name         AYABancahUserScript-1.4.user.js
// @namespace    https://aya.app.br/
// @version      1.4
// @description  Aplica estilo customizado à página da AYA Bancah, otimiza performance e adiciona atalhos de navegação pelo teclado
// @match        https://aya.app.br/ayabancah/minha-banca/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // 1. ESTILIZAÇÃO E PERFORMANCE
    GM_addStyle(`
        /* Otimização de performance / Redução de custo de renderização */
        *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
        }

        /* Aceleração de hardware (GPU) */
        #contentfactory,
        iframe[id^="slideviewer-slide"],
        .cf-wrapper {
            transform: translateZ(0) !important;
            will-change: transform, opacity !important;
            backface-visibility: hidden !important;
        }

        /* Ocultação de elementos desnecessários */
        .col-3.box-padding,
        a.close-content,
        .col-1,
        .content-list,
        #app-banner,
        .app-banner-overlay {
            display: none !important;
        }

        /* Layout e Zoom configurado para 225% */
        html {
            zoom: 225%;
        }

        section {
            margin: 0 !important;
            padding: 0 !important;
        }

        .row {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
        }

        .col-8 {
            width: 100% !important;
            max-width: 100% !important;
            flex: 0 0 100% !important;
        }

        iframe[id^="slideviewer-slide"] {
            width: 100% !important;
        }

        #contentfactory {
            margin-top: 0 !important;
        }

        /* Controladores de página */
        .training-nav {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            margin-top: 15px !important;
            padding-bottom: 20px !important;
            background: transparent !important;
        }

        .training-nav .col-3,
        .training-nav .col-6 {
            flex: initial !important;
            max-width: none !important;
            width: auto !important;
        }

        .training-nav .counter {
            font-size: 1.5em !important;
            margin: 0 30px !important;
            font-weight: bold !important;
        }
    `);

    // 2. NAVEGAÇÃO VIA TECLADO
    let isNavigating = false;

    // Obtém o número da página atual e total baseado em: <div class="col-6 counter"><span>1 / 120</span></div>
    function getCounterPages() {
        const spanElem = document.querySelector('.counter span') || document.querySelector('.counter');
        if (!spanElem || !spanElem.textContent.includes('/')) return null;

        const parts = spanElem.textContent.split('/').map(v => parseInt(v.trim(), 10));
        if (isNaN(parts[0]) || isNaN(parts[1])) return null;

        return { curr: parts[0], total: parts[1] };
    }

    function triggerClick(el) {
        if (!el) return false;
        el.click();
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        return true;
    }

    function clickNext() {
        const nextArrow = document.querySelector('.training-nav .next');
        if (nextArrow && !nextArrow.classList.contains('disabled')) {
            const btn = nextArrow.querySelector('a') || nextArrow;
            return triggerClick(btn);
        }
        return false;
    }

    function clickPrevious() {
        const prevArrow = document.querySelector('.training-nav .previous');
        if (prevArrow && !prevArrow.classList.contains('disabled')) {
            const btn = prevArrow.querySelector('a') || prevArrow;
            return triggerClick(btn);
        }
        return false;
    }

    // Navega rapidamente até o extremo (primeira ou última página)
    function goToExtreme(targetDirection) {
        if (isNavigating) return;
        isNavigating = true;

        const interval = setInterval(() => {
            const pages = getCounterPages();
            if (!pages) {
                clearInterval(interval);
                isNavigating = false;
                return;
            }

            if (targetDirection === 'first') {
                if (pages.curr <= 1 || !clickPrevious()) {
                    clearInterval(interval);
                    isNavigating = false;
                }
            } else if (targetDirection === 'last') {
                if (pages.curr >= pages.total || !clickNext()) {
                    clearInterval(interval);
                    isNavigating = false;
                }
            }
        }, 50);
    }

    window.addEventListener('keydown', function(event) {
        const tag = event.target.tagName ? event.target.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea' || event.target.isContentEditable) {
            return;
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            if (event.ctrlKey) {
                goToExtreme('last');
            } else {
                clickNext();
            }
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            if (event.ctrlKey) {
                goToExtreme('first');
            } else {
                clickPrevious();
            }
        }
    });

})();
