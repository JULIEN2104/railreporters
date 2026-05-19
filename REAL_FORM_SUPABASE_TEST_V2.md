# RailReporters — Test vrai formulaire Supabase V2

## Objectif

Ce document garde une trace du test de connexion du vrai formulaire RailReporters à Supabase depuis le site local.

La version publique V1.2 sur `railreporters.com` reste inchangée.

---

## 1. But du test

Vérifier que le vrai formulaire principal RailReporters peut créer un report complet dans Supabase.

Le test doit valider :

- création d’un report dans `reports`;
- création des sections dans `report_sections`;
- upload d’une photo dans Supabase Storage ;
- récupération de l’URL publique de la photo ;
- création d’une ligne dans `report_photos`;
- passage du report en `published`;
- relecture du report depuis Supabase ;
- affichage du report avec son auteur, ses sections et sa photo.

---

## 2. Fichiers locaux utilisés

Fichiers locaux utilisés pour le test :

```text
index.html
script.js
script-auth-test.js
