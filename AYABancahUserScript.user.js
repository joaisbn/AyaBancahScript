// ==UserScript==
// @name         AYABancahUserScript.user.js
// @namespace    https://aya.app.br/
// @version      4.0
// @description  Aplica estilo customizado, hand tool nativa, controles de zoom livres e exportação para nova aba
// @match        https://aya.app.br/ayabancah/minha-banca/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // 1. ESTILIZAÇÃO, PERFORMANCE E VARIÁVEIS CSS
    GM_addStyle(`
        :root {
            --reader-zoom: 2.25; /* Zoom inicial (225%) */
        }

        /* Otimização de performance */
        *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
        }

        /* Oculta interface original e bloqueios invisíveis */
        .col-3.box-padding,
        a.close-content,
        .col-1,
        .content-list,
        #app-banner,
        .app-banner-overlay,
        .training-nav,
        .overlayContextMenu {
            display: none !important;
            pointer-events: none !important;
        }

        html { zoom: 100% !important; }
        body {
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #222 !important;
        }

        /* Libera os containers para crescerem horizontalmente com o zoom */
        section, .row, .col-8, .cf-wrapper {
            margin: 0 !important;
            padding: 0 !important;
            max-width: none !important;
            width: auto !important;
            flex: none !important;
        }

        /* CONTÊINER DE ARRASTO (VIEWPORT) */
        #contentfactory {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            overflow: auto !important; /* Habilita as barras de rolagem */
            margin: 0 !important;
            background: #333 !important;
            cursor: grab !important;
        }
        #contentfactory:active {
            cursor: grabbing !important;
        }

        /* IFRAME DA PÁGINA (ISOLADO E ESCALÁVEL) */
        iframe[id^="slideviewer-slide"] {
            zoom: var(--reader-zoom) !important;
            width: 1000px !important; /* Largura base garantida para formato jornal/tabloid */
            height: 1500px !important; /* Altura base para não cortar o rodapé */
            border: none !important;
            background: #fff;
            transform: translateZ(0) !important;
            will-change: transform, opacity !important;
            display: block !important;
            margin: 0 auto !important;
            pointer-events: none !important; /* Crucial: ignora o mouse para o wrapper pai poder ser arrastado */
            transform-origin: top left !important;
        }

        /* HUD - BARRA DE CONTROLES CUSTOMIZADA */
        .custom-nav {
            position: fixed !important;
            bottom: 20px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            display: flex !important;
            gap: 15px !important;
            background: rgba(25, 25, 25, 0.95) !important;
            padding: 10px 15px !important;
            border-radius: 10px !important;
            box-shadow: 0 5px 25px rgba(0,0,0,0.8) !important;
            z-index: 9999 !important;
            backdrop-filter: blur(5px) !important;
            transition: bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease !important;
        }

        .custom-nav.hidden {
            bottom: -100px !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }

        .nav-group {
            display: flex !important;
            align-items: center !important;
            gap: 5px !important;
            background: rgba(0, 0, 0, 0.4) !important;
            padding: 6px 10px !important;
            border-radius: 6px !important;
        }

        .custom-nav button {
            background: #444 !important;
            color: #fff !important;
            border: 1px solid #555 !important;
            border-radius: 4px !important;
            padding: 6px 12px !important;
            cursor: pointer !important;
            font-weight: bold !important;
            font-size: 1.1em !important;
            transition: all 0.2s !important;
        }
        .custom-nav button:hover { background: #666 !important; }

        .custom-nav input[type="number"] {
            width: 50px !important;
            text-align: center !important;
            font-size: 1.1em !important;
            font-weight: bold !important;
            border: 1px solid #555 !important;
            border-radius: 4px !important;
            padding: 5px !important;
            background: #222 !important;
            color: #fff !important;
        }
        .custom-nav span.nav-text {
            color: #fff !important;
            font-size: 1.1em !important;
            font-weight: bold !important;
            min-width: 50px !important;
            text-align: center !important;
        }

        /* BOTÃO FLUTUANTE (EYE) */
        .toggle-hud-btn {
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            background: rgba(25, 25, 25, 0.9) !important;
            color: #fff !important;
            border: 1px solid #555 !important;
            border-radius: 50% !important;
            width: 50px !important;
            height: 50px !important;
            font-size: 1.5em !important;
            cursor: pointer !important;
            z-index: 10000 !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            transition: background 0.2s !important;
        }
        .toggle-hud-btn:hover { background: #444 !important; }
    `);

    // ESTADOS GLOBAIS
    let pdfUrls = [];
    let currentPage = 1;
    let totalPages = 1;
    let currentZoom = 2.25; // Baseado no 225% anterior
    let isHudVisible = true;
    let iframeEl = null;

    // 2. INICIALIZAÇÃO
    async function init() {
        const cf = document.getElementById('contentfactory');
        if (!cf) {
            setTimeout(init, 500);
            return;
        }

        const dataUrl = cf.getAttribute('data-load-url');
        if (!dataUrl) return;

        try {
            const res = await fetch(dataUrl);
            const json = await res.json();

            pdfUrls = json.renderData.pdfs;
            totalPages = pdfUrls.length;

            buildCustomInterface();
            setupZoomAndDrag();
        } catch (e) {
            console.error('Falha ao carregar dados.json', e);
        }
    }

    // 3. CONSTRUÇÃO DA INTERFACE CUSTOMIZADA
    function buildCustomInterface() {
        iframeEl = document.querySelector('iframe[id^="slideviewer-slide"]');

        if (iframeEl && iframeEl.src) {
            const currentIndex = pdfUrls.findIndex(url => url === iframeEl.src);
            if (currentIndex !== -1) currentPage = currentIndex + 1;
        }

        const oldNav = document.querySelector('.training-nav');
        if (oldNav) oldNav.remove();

        const navContainer = document.createElement('div');
        navContainer.id = 'custom-nav-bar';
        navContainer.className = 'custom-nav';

        navContainer.innerHTML = `
            <!-- Paginação -->
            <div class="nav-group">
                <button id="btn-prev" title="Página Anterior">⬅️</button>
                <input type="number" id="input-page" value="${currentPage}" min="1" max="${totalPages}">
                <span class="nav-text">/ ${totalPages}</span>
                <button id="btn-next" title="Próxima Página">➡️</button>
            </div>

            <!-- Controle de Zoom -->
            <div class="nav-group">
                <button id="btn-zoom-out" title="Reduzir Zoom">➖</button>
                <span id="zoom-display" class="nav-text">${Math.round(currentZoom * 100)}%</span>
                <button id="btn-zoom-in" title="Ampliar Zoom">➕</button>
                <button id="btn-zoom-reset" title="Restaurar Zoom Padrão">🔄</button>
            </div>

            <!-- Botão para extração de texto (Nova Aba) -->
            <div class="nav-group">
                <button id="btn-open-tab" title="Abrir página em nova aba (para copiar texto sem bloqueios)">🔗 Abrir Aba</button>
            </div>
        `;

        document.body.appendChild(navContainer);

        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'btn-toggle-hud';
        toggleBtn.className = 'toggle-hud-btn';
        toggleBtn.title = 'Ocultar/Exibir Controles';
        toggleBtn.innerHTML = '👁️';
        document.body.appendChild(toggleBtn);

        // Eventos
        document.getElementById('btn-prev').addEventListener('click', () => changePage(currentPage - 1));
        document.getElementById('btn-next').addEventListener('click', () => changePage(currentPage + 1));
        document.getElementById('input-page').addEventListener('change', (e) => changePage(parseInt(e.target.value, 10)));

        document.getElementById('btn-open-tab').addEventListener('click', () => {
            if (pdfUrls.length > 0 && pdfUrls[currentPage - 1]) {
                window.open(pdfUrls[currentPage - 1], '_blank');
            }
        });

        toggleBtn.addEventListener('click', () => {
            isHudVisible = !isHudVisible;
            navContainer.classList.toggle('hidden', !isHudVisible);
            toggleBtn.style.opacity = isHudVisible ? '1' : '0.5';
        });
    }

    // 4. LÓGICA DE TROCA DE PÁGINA
    function changePage(n) {
        if (n < 1) n = 1;
        if (n > totalPages) n = totalPages;
        currentPage = n;

        if (iframeEl) iframeEl.src = pdfUrls[n - 1];

        const input = document.getElementById('input-page');
        if (input) input.value = n;

        const container = document.getElementById('contentfactory');
        if (container) {
            container.scrollTop = 0;
            container.scrollLeft = 0;
        }
    }

    // 5. ATALHOS DE TECLADO
    window.addEventListener('keydown', function(event) {
        const tag = event.target.tagName ? event.target.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea' || event.target.isContentEditable) return;

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            changePage(event.ctrlKey ? totalPages : currentPage + 1);
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            changePage(event.ctrlKey ? 1 : currentPage - 1);
        }
    });

    // 6. ZOOM E ARRASTO (HAND TOOL NATIVO)
    function setupZoomAndDrag() {
        document.getElementById('btn-zoom-in').addEventListener('click', () => updateZoom(0.25));
        document.getElementById('btn-zoom-out').addEventListener('click', () => updateZoom(-0.25));
        document.getElementById('btn-zoom-reset').addEventListener('click', () => { currentZoom = 2.25; updateZoom(0); });

        const container = document.getElementById('contentfactory');
        if (!container) return;

        let isDragging = false;
        let startX, startY, scrollLeft, scrollTop;

        container.addEventListener('mousedown', (e) => {
            // Permite arrastar livremente com botão esquerdo (0) ou do meio (1)
            if (e.button === 0 || e.button === 1) {
                e.preventDefault();
                isDragging = true;
                container.style.cursor = 'grabbing';

                startX = e.pageX - container.offsetLeft;
                startY = e.pageY - container.offsetTop;
                scrollLeft = container.scrollLeft;
                scrollTop = container.scrollTop;
            }
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                container.style.cursor = 'grab';
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();

            const x = e.pageX - container.offsetLeft;
            const y = e.pageY - container.offsetTop;
            const walkX = (x - startX) * 1.5;
            const walkY = (y - startY) * 1.5;

            container.scrollLeft = scrollLeft - walkX;
            container.scrollTop = scrollTop - walkY;
        });
    }

    function updateZoom(delta) {
        currentZoom += delta;
        if (currentZoom < 0.5) currentZoom = 0.5;
        if (currentZoom > 5.0) currentZoom = 5.0;

        document.documentElement.style.setProperty('--reader-zoom', currentZoom);
        document.getElementById('zoom-display').innerText = Math.round(currentZoom * 100) + '%';
    }

    init();

})();
