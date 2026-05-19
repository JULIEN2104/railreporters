# RailReporters — Test publication commentaire Supabase V2

## Objectif

Ce document garde une trace du test de création d’un commentaire Supabase depuis le site local RailReporters.

La version publique V1.2 sur `railreporters.com` reste inchangée.

---

## 1. But du test

Vérifier que le site local peut :

- trouver un report Supabase publié ;
- créer un commentaire dans la table `comments`;
- lier ce commentaire au report ;
- lier ce commentaire à l’utilisateur connecté ;
- relire ensuite le report avec son commentaire ;
- afficher l’auteur du commentaire.

---

## 2. Fichiers locaux utilisés

Fichiers locaux utilisés pour le test :

```text
index.html
script.js
script-auth-test.js
