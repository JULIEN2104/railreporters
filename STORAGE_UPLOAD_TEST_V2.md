# RailReporters — Test upload photo Supabase Storage V2

## Objectif

Ce document garde une trace du premier test d’upload photo depuis une page locale vers Supabase Storage.

La version publique V1.2 sur `railreporters.com` reste inchangée.

---

## 1. But du test

Vérifier qu’une page locale peut :

- connecter un utilisateur Supabase ;
- sélectionner une image locale ;
- uploader cette image dans le bucket `report-photos`;
- récupérer le chemin Storage ;
- récupérer l’URL publique ;
- afficher l’image uploadée.

---

## 2. Bucket utilisé

Bucket Supabase Storage :

```text
report-photos
