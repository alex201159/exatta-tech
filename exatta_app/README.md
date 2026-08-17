# Exatta Tech App

Aplicativo Flutter Android da Exatta Tech.

## O que tem nesta primeira versão

- Tela inicial com destaque de produto e atalhos.
- Central dos Balanceiros com busca por fabricante, modelo, manual e vídeo.
- Aba Produtos com licenças, equipamentos e serviços.
- Tela de contato com WhatsApp, e-mail e site.
- Dados carregados localmente de `assets/data/base.json` e `assets/data/overrides.json`.

## Rodar localmente

```sh
flutter pub get
flutter run
```

## Gerar APK debug

```sh
flutter build apk --debug
```

O APK fica em:

```text
build/app/outputs/flutter-apk/app-debug.apk
```
