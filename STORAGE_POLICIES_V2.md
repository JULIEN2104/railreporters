# RailReporters — Storage Policies V2

## Objectif

Ce document prépare les règles d’accès Supabase Storage pour la V2 communautaire de RailReporters.

Le bucket `report-photos` a été créé et testé manuellement.

La V1.2 du site reste indépendante de Supabase pour l’instant.

---

## 1. État actuel

Bucket créé :

- nom : `report-photos`
- type : public
- test upload manuel : validé
- URL publique : validée
- URL enregistrée dans `report_photos` : validée

---

## 2. Rappel important

Un bucket public permet de lire les fichiers si l’on possède l’URL.

Mais les opérations suivantes restent contrôlées par les règles d’accès :

- upload ;
- suppression ;
- déplacement ;
- copie.

Supabase Storage utilise les policies sur `storage.objects`.

---

## 3. Objectif des policies

Les règles devront permettre :

- la lecture publique des photos de reports publiés ;
- l’upload seulement par un utilisateur connecté ;
- l’upload seulement dans son propre dossier ;
- la suppression par l’auteur ;
- la suppression par l’administrateur ;
- l’interdiction d’upload pour un utilisateur banni ;
- la protection contre les fichiers envoyés au mauvais endroit.

---

## 4. Structure de chemin recommandée

Structure cible :

```text
report-photos/
  user_id/
    report_id/
      filename.jpg
