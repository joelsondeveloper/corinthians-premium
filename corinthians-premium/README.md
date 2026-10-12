# Corinthians Premium

Experiência visual sobre o Corinthians com React, TypeScript, Vite, GSAP e Three.js.

## Executar

Use Node.js 22.14 ou superior. A partir desta pasta:

```sh
npm ci
npm run dev
```

## Validar antes de publicar

```sh
npm run lint
npm test
npm run build
npm run preview
```

Verifique também navegação por teclado, menu em tela pequena, rolagem e a preferência
de movimento reduzido do sistema. O teste de partículas cobre a posição do mouse
exatamente sobre um confete e o retorno das partículas aos limites da tela.

## Publicação

O projeto existente da Vercel acompanha a branch `main` do repositório
`joelsondeveloper/corinthians-premium`. Root Directory: `corinthians-premium`;
comando de build: `npm run build`; pasta de saída: `dist`.
Após o envio, confirme que o deployment está Ready e corresponde ao novo commit.

## Desempenho e acessibilidade

- A interface e o conteúdo carregam separados do módulo WebGL.
- Imagens WebP otimizadas são servidas; os PNGs originais permanecem como fontes.
- O vídeo/WebGL pausa com a aba oculta e ao chegar à seção histórica.
- Confetes só são atualizados enquanto sua seção está visível.
- Movimento reduzido oferece conteúdo estático e dispensa WebGL e confetes.
- O menu inclui somente as seções implementadas e funciona por teclado.
