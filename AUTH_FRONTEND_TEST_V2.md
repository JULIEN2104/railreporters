# RailReporters — Test Auth Frontend V2

## Objectif

Ce document garde une trace du premier test de connexion Supabase réalisé depuis une page HTML locale.

La V1.2 du site public reste stable et indépendante de Supabase.

---

## 1. But du test

Vérifier qu’une page locale peut :

- initialiser le client Supabase ;
- utiliser l’URL publique du projet ;
- utiliser la clé publishable ;
- connecter un utilisateur avec email + mot de passe ;
- récupérer le profil utilisateur depuis la table `profiles`;
- lire le rôle utilisateur ;
- lire le statut `is_banned`.

---

## 2. Fichier utilisé

Un fichier local de test a été utilisé :

```text
auth_test_supabase_sans_code.html
