# AYA Bancah - Leitor Otimizado

Script para navegadores (Greasemonkey/Tampermonkey) que revoluciona a interface de leitura de jornais e revistas na plataforma AYA Bancah. O projeto foca em resolver problemas de lentidão, usabilidade ruim no desktop e limitações impostas pela interface original.

## 🚀 Funcionalidades (Features)

* **Performance Otimizada (Aceleração de GPU):** Força a renderização do conteúdo pesado (milhares de linhas de CSS do gerador de HTML) diretamente na placa de vídeo, eliminando os engasgos (lags) ao rolar a página. Animações desnecessárias da interface foram desativadas para poupar CPU.
* **Layout Limpo (Clean Reading):** Esconde a coluna lateral de miniaturas, banners promocionais do aplicativo, botões redundantes e listas sobrepostas, forçando a página de leitura a ocupar 100% do espaço útil da tela.
* **Hand Tool Nativa (Arrastar e Soltar):** Permite mover a página livremente clicando e arrastando com o botão esquerdo ou com o botão do meio (scroll click) do mouse.
* **Zoom Livre e Isolado:** Sistema de zoom refeito do zero. Em vez de dar zoom na interface inteira do navegador (o que cortava o lado direito da tela), o zoom é aplicado exclusivamente ao iframe da revista, permitindo rolagem horizontal e vertical perfeitas.
* **Navegação Instantânea:** Intercepta o arquivo `dados.json` da plataforma para capturar todas as URLs de renderização. Isso permite pular instantaneamente para qualquer página sem precisar simular cliques sequenciais lentos.
* **HUD Customizado (Barra de Ferramentas):** Substitui a navegação original por uma barra flutuante no rodapé contendo:
  * Input numérico para salto direto de página.
  * Controles de Zoom (Ampliar, Reduzir e Restaurar).
  * Botão de "Extração" (🔗 Abrir Aba), que abre a página atual em uma nova aba livre da "camada invisível" de bloqueio da plataforma, permitindo a seleção e cópia de textos.
  * Botão "👁️" discreto para ocultar/exibir toda a barra de ferramentas.

## ⌨️ Atalhos de Teclado

Navegue facilmente sem usar o mouse (os atalhos são desativados automaticamente se você estiver digitando no campo de número de página):

* <kbd>Seta Direita ➡️</kbd> : Avança uma página.
* <kbd>Seta Esquerda ⬅️</kbd> : Volta uma página.
* <kbd>Ctrl</kbd> + <kbd>Seta Direita ➡️</kbd> : Pula instantaneamente para a **última** página da edição.
* <kbd>Ctrl</kbd> + <kbd>Seta Esquerda ⬅️</kbd> : Retorna instantaneamente para a **primeira** página.

## 🛠️ Como Instalar

1. Instale uma extensão de gerenciamento de scripts no seu navegador, como o **Tampermonkey** (Chrome, Edge, Firefox, Safari) ou **Greasemonkey** (Firefox).
2. Abra o painel da extensão e selecione a opção **"Criar novo script"** (Add a new script).
3. Apague o conteúdo padrão, copie o código inteiro do script `AYABancahUserScript-4.0.user.js` e cole no editor.
4. Salve o arquivo (geralmente `Ctrl + S` ou Arquivo > Salvar).
5. Acesse qualquer edição na AYA Bancah (`https://aya.app.br/ayabancah/minha-banca/...`) e o script será ativado automaticamente.
