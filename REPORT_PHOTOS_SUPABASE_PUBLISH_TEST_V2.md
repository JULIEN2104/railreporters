# RailReporters — Test publication report + sections + photo Supabase V2

## Objectif

Ce document garde une trace du test de création d’un report Supabase avec plusieurs sections et une photo Storage depuis le site local RailReporters.

La version publique V1.2 sur `railreporters.com` reste inchangée.

---

## 1. But du test

Vérifier que le site local peut :

- créer un report dans la table `reports`;
- créer plusieurs sections dans `report_sections`;
- uploader une photo dans Supabase Storage ;
- récupérer l’URL publique de la photo ;
- créer une ligne dans `report_photos`;
- relire ensuite le report avec sa photo depuis Supabase.

---

## 2. Fichiers locaux utilisés

Fichiers locaux utilisés pour le test :

```text
index.html
script.js
script-auth-test.js
