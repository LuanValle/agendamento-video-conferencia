# Notas de aprendizado

## Conversao entre API e tela

Ponto para revisar depois: ainda nao ficou totalmente claro como funciona a conversao entre os nomes do banco/API e os nomes usados pelo React.

Exemplo:

```js
setConferences((result.data || []).map(apiToConference))
```

Ideia principal:

- `result.data` vem da API no formato do banco.
- `.map(...)` percorre cada item da lista.
- `apiToConference` transforma cada item para o formato que a tela ja entende.

Exemplo de campo:

```text
Banco/API: plataforma
Tela React: platform
```

Outro exemplo:

```text
Banco/API: horario
Tela React: time
```

Essa conversao existe para evitar reescrever todos os componentes da tela agora.
