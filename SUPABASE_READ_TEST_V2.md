# RailReporters — Test lecture Supabase V2

## Objectif

Ce document garde une trace du test de lecture Supabase réalisé localement.

La V1.2 publique de RailReporters reste stable et indépendante de Supabase.

---

## 1. But du test

Vérifier qu’une page locale peut lire les données Supabase suivantes :

- report depuis la table `reports`;
- auteur du report depuis la table `profiles`;
- sections depuis la table `report_sections`;
- photos depuis la table `report_photos`;
- commentaires depuis la table `comments`;
- auteur des commentaires depuis la table `profiles`.

---

## 2. Fichier de test utilisé

Un fichier local a été utilisé :

```text
supabase-read-test-sans-code.html
