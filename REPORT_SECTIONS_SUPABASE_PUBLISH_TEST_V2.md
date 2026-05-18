# RailReporters — Test publication sections Supabase V2

## Objectif

Ce document garde une trace du test de création automatique d’une section Supabase après la création d’un report depuis le site local RailReporters.

La version publique V1.2 sur `railreporters.com` reste inchangée.

---

## 1. But du test

Vérifier que le site local peut :

- créer un report dans la table `reports`;
- récupérer l’ID du report créé ;
- créer automatiquement une section liée dans `report_sections`;
- afficher ensuite le report et sa section dans la zone de lecture Supabase.

---

## 2. Fichiers locaux utilisés

Fichiers locaux utilisés pour le test :

```text
index.html
script.js
script-auth-test.js
