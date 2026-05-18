# RailReporters — Reports Supabase Integration Plan

## Objectif

Ce document prépare la migration progressive des reports RailReporters depuis `localStorage` vers Supabase.

La V1.2 publique sur `railreporters.com` reste stable.

L’authentification Supabase fonctionne déjà en local.

La prochaine grande étape est de permettre aux reports d’être :

- créés par un utilisateur connecté ;
- enregistrés dans Supabase ;
- visibles par tous ;
- liés à un auteur ;
- associés à des sections ;
- associés à des photos ;
- associés à des commentaires.

---

## 1. Situation actuelle

Aujourd’hui, dans la V1.2 :

- les reports sont enregistrés dans le navigateur avec `localStorage`;
- chaque utilisateur voit ses propres reports locaux ;
- les reports ne sont pas partagés entre visiteurs ;
- les photos sont compressées puis stockées localement ;
- les commentaires sont aussi locaux ;
- l’auteur du report n’est pas vraiment enregistré.

Cette version reste utile comme prototype stable.

---

## 2. Objectif de la migration

La V2 doit remplacer progressivement `localStorage` par Supabase.

Objectif final :

- un membre connecté publie un report ;
- le report est enregistré dans la table `reports`;
- les étapes sont enregistrées dans `report_sections`;
- les photos sont envoyées dans Supabase Storage ;
- les URLs des photos sont enregistrées dans `report_photos`;
- les commentaires sont enregistrés dans `comments`;
- l’auteur du report est affiché ;
- l’auteur des commentaires est affiché ;
- l’administrateur peut modérer.

---

## 3. Tables concernées

Tables principales :

- `profiles`
- `reports`
- `report_sections`
- `report_photos`
- `comments`

Tables liées à la modération :

- `moderation_reports`
- `user_bans`

---

## 4. Relations importantes

Relations déjà préparées :

```text
profiles.id → reports.user_id
reports.id → report_sections.report_id
reports.id → report_photos.report_id
report_sections.id → report_photos.section_id
profiles.id → report_photos.user_id
reports.id → comments.report_id
profiles.id → comments.user_id
