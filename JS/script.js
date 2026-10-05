'use strict';

/* =========================
   ÍCONES
========================= */

function inicializarIcones() {
    // Uma falha no carregamento do CDN não impede as outras funcionalidades.
    if (
        window.lucide &&
        typeof window.lucide.createIcons === 'function'
    ) {
        window.lucide.createIcons();
    }
}

/* =========================
   MENU
========================= */

function inicializarMenu() {
    const botao = document.querySelector('.cabecalho-menu');
    const menu = document.querySelector('.cabecalho-links');
    const cabecalho = document.querySelector('.cabecalho');

    if (!botao || !menu || !cabecalho) return;

    const telaCompacta = window.matchMedia('(max-width: 1100px)');

    document.documentElement.classList.add('js-ativo');
    botao.hidden = false;

    function definirMenuAberto(aberto) {
        menu.classList.toggle('menu-aberto', aberto);

        botao.setAttribute('aria-expanded', String(aberto));
        botao.setAttribute(
            'aria-label',
            aberto ? 'Fechar menu' : 'Abrir menu'
        );
    }

    // Abre ou fecha ao clicar no botão.
    botao.addEventListener('click', () => {
        const aberto = botao.getAttribute('aria-expanded') === 'true';

        definirMenuAberto(!aberto);
    });

    // Fecha após selecionar um link no menu compacto.
    menu.addEventListener('click', (evento) => {
        const link = evento.target.closest('a[href^="#"]');

        if (!link || !telaCompacta.matches) return;

        const destino = document.getElementById(link.hash.slice(1));

        definirMenuAberto(false);

        // Move o foco antes de esconder a navegação que continha o link.
        if (destino) {
            if (!destino.hasAttribute('tabindex')) {
                destino.setAttribute('tabindex', '-1');

                destino.addEventListener(
                    'blur',
                    () => destino.removeAttribute('tabindex'),
                    { once: true }
                );
            }

            destino.focus({ preventScroll: true });
        }
    });

    // Fecha com Escape e devolve o foco ao botão.
    document.addEventListener('keydown', (evento) => {
        const aberto = botao.getAttribute('aria-expanded') === 'true';

        if (evento.key === 'Escape' && aberto) {
            definirMenuAberto(false);
            botao.focus();
        }
    });

    // Fecha ao clicar fora do cabeçalho.
    document.addEventListener('click', (evento) => {
        const aberto = botao.getAttribute('aria-expanded') === 'true';

        if (!cabecalho.contains(evento.target) && aberto) {
            const focoNoMenu = menu.contains(document.activeElement);

            definirMenuAberto(false);

            if (focoNoMenu) {
                botao.focus();
            }
        }
    });

    // Reinicia o estado ao alternar entre menu compacto e desktop.
    telaCompacta.addEventListener('change', () => {
        const focoNoMenu = menu.contains(document.activeElement);
        const focoNoBotao = document.activeElement === botao;

        definirMenuAberto(false);

        if (telaCompacta.matches && focoNoMenu) {
            botao.focus();
        }

        if (!telaCompacta.matches && focoNoBotao) {
            menu.querySelector('a')?.focus();
        }
    });
}

/* =========================
   VÍDEOS DOS SERVIÇOS
========================= */

function inicializarVideos() {
    const videos = document.querySelectorAll('.servico-video');

    const possuiHover = window.matchMedia(
        '(hover: hover) and (pointer: fine)'
    );

    const movimentoReduzido = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    );

    const encerrarPrevias = [];

    videos.forEach((video) => {
        const card = video.closest('.servico-card');

        if (!card) return;

        let previaAtiva = false;
        let versaoReproducao = 0;

        function encerrarPrevia() {
            if (!previaAtiva) return;

            previaAtiva = false;
            versaoReproducao += 1;

            video.pause();

            // Reinicia somente depois de carregar os metadados.
            if (video.readyState >= 1) {
                video.currentTime = 0;
            }
        }

        card.addEventListener('pointerenter', (evento) => {
            const podeExibirPrevia =
                evento.pointerType === 'mouse' &&
                possuiHover.matches &&
                !movimentoReduzido.matches;

            if (!podeExibirPrevia) return;

            // Preserva uma reprodução iniciada pelos controles nativos.
            if (!video.paused) return;

            previaAtiva = true;

            const versaoAtual = ++versaoReproducao;

            video.play()
                .then(() => {
                    // O play pode terminar depois que o mouse saiu do card.
                    if (
                        !previaAtiva &&
                        versaoAtual !== versaoReproducao
                    ) {
                        video.pause();
                    }
                })
                .catch(() => {
                    // Trata bloqueio de reprodução ou mídia indisponível.
                    if (versaoAtual === versaoReproducao) {
                        previaAtiva = false;
                    }
                });
        });

        card.addEventListener('pointerleave', encerrarPrevia);

        encerrarPrevias.push(encerrarPrevia);
    });

    function encerrarTodasAsPrevias() {
        encerrarPrevias.forEach((encerrar) => encerrar());
    }

    movimentoReduzido.addEventListener(
        'change',
        encerrarTodasAsPrevias
    );

    possuiHover.addEventListener(
        'change',
        encerrarTodasAsPrevias
    );

    // Pausa os vídeos quando a aba deixa de estar visível.
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            encerrarTodasAsPrevias();

            videos.forEach((video) => {
                video.pause();
            });
        }
    });
}

/* =========================
   INICIALIZAÇÃO
========================= */

function inicializarPagina() {
    inicializarIcones();
    inicializarMenu();
    inicializarVideos();

    const ano = document.getElementById('ano-atual');

    if (ano) {
        ano.textContent = String(new Date().getFullYear());
    }
}

if (document.readyState === 'loading') {
    document.addEventListener(
        'DOMContentLoaded',
        inicializarPagina,
        { once: true }
    );
} else {
    inicializarPagina();
}