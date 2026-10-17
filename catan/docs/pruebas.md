# Guía rápida de pruebas (mocha)

Todos los comandos se corren desde `catan/backend`.

## Scripts listos

| Comando | Qué hace |
|---|---|
| `npm test` | Todas las pruebas, reporter por defecto. |
| `npm run test:spec` | Lista cada prueba con ✔/✖ y su tiempo en ms. |
| `npm run test:dot` | Un punto por prueba, salida corta. Ideal para TDD. |
| `npm run test:watch` | Como `dot`, pero se vuelve a ejecutar al guardar archivos. |

Todos aceptan opciones extra después de `--`:

```
npm run test:dot -- -g "ciclo"
npm run test:spec -- --bail
```

## Probar un solo archivo

Los scripts corren todos los archivos de `test/`. Para uno solo:

```
npx mocha -r tsx .\test\caminoMasLargo.test.ts --reporter dot --no-diff --exit
```

## Opciones de mocha que usamos

| Opción | Qué hace |
|---|---|
| `-r tsx` | Permite correr archivos TypeScript. |
| `-g "texto"` | Corre solo las pruebas cuyo nombre contenga el texto. |
| `--reporter spec` | Lista cada prueba (por defecto). |
| `--reporter dot` | Un punto por prueba. |
| `--reporter min` | Limpia la pantalla y deja solo el resumen. |
| `--slow N` | Umbral en ms para marcar una prueba como lenta. Con `0` se muestran todos los tiempos. |
| `--timeout N` | Tiempo máximo por prueba en ms (por defecto 2000). |
| `--bail` | Se detiene en la primera prueba que falle. |
| `--exit` | Cierra el proceso al terminar aunque queden conexiones abiertas. |
| `--no-diff` | Quita la comparación detallada cuando falla un `assert`. |
| `--watch` | Vuelve a ejecutar al guardar. |
| `--forbid-only` | Falla si queda un `it.only` olvidado. |

Para probar una sola prueba mientras se desarrolla, se puede poner `it.only(...)`, pero hay que quitarlo antes del commit.
