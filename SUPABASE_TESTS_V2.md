# RailReporters — Tests Supabase V2

## Objectif

Ce document garde une trace des premiers tests réalisés dans Supabase pour préparer la V2 communautaire de RailReporters.

La V1.2 du site reste stable et indépendante de Supabase pour l’instant.

---

## 1. Projet Supabase

Projet Supabase retrouvé :

- nom du projet : railreporters
- statut : Healthy
- région : West EU / Ireland
- Table Editor : accessible
- SQL Editor : accessible

---

## 2. Tables créées

Le script `SUPABASE_SCHEMA_V2.sql` a été exécuté dans Supabase.

Tables visibles dans Table Editor :

- profiles
- reports
- report_sections
- report_photos
- comments
- moderation_reports
- user_bans

Statut : validé.

---

## 3. Utilisateur test

Un utilisateur test a été créé dans :

Authentication → Users

Statut : validé.

---

## 4. Table profiles

Après création de l’utilisateur test, une ligne a été créée automatiquement dans la table `profiles`.

Cela valide le trigger :

- `handle_new_user()`
- `on_auth_user_created`

Le rôle par défaut était :

- member

Le rôle a ensuite été modifié en :

- admin

Statut : validé.

---

## 5. Table reports

Un report de test a été créé manuellement dans la table `reports`.

Données principales utilisées :

- title : Test Supabase RailReporters
- train : TGV INOUI
- operator : SNCF
- departure_station : Paris Gare de Lyon
- departure_time : 10:00
- arrival_station : Lyon Part-Dieu
- arrival_time : 12:00
- travel_date : 2026-05-04
- travel_class : 1ère classe
- rating : 5
- conclusion : Test de création d’un report dans Supabase.
- status : published

Le champ `user_id` a été relié au profil admin.

Statut : validé.

---

## 6. Table report_sections

Une section de test a été créée dans `report_sections`.

Données utilisées :

- report_id : id du report de test
- section_type : station_arrival
- title : Arrivée en gare
- content : Test de section liée au report Supabase.
- position : 1

Erreur rencontrée :

- `station arrival` avec espace a été refusé
- correction avec `station_arrival`

Cela confirme que la contrainte `section_type` fonctionne.

Statut : validé.

---

## 7. Table comments

Un commentaire de test a été créé dans `comments`.

Données utilisées :

- report_id : id du report de test
- user_id : id du profil admin
- content : Test de commentaire lié au report Supabase.
- status : published

Statut : validé.

---

## 8. Table report_photos

Une photo de test a été créée dans `report_photos`.

Données utilisées :

- report_id : id du report de test
- section_id : id de la section de test
- user_id : id du profil admin
- photo_url : https://example.com/test-photo.jpg
- caption : Photo de test Supabase
- position : 1

Il ne s’agit pas encore d’un vrai upload Supabase Storage.

Statut : validé.

---

## 9. Relations validées

Relations testées avec succès :

- auth.users → profiles
- profiles.id → reports.user_id
- reports.id → report_sections.report_id
- reports.id → comments.report_id
- profiles.id → comments.user_id
- reports.id → report_photos.report_id
- report_sections.id → report_photos.section_id
- profiles.id → report_photos.user_id

---

## 10. Ce qui n’est pas encore fait

Non encore réalisé :

- connexion du site railreporters.com à Supabase
- inscription / connexion depuis le site
- vraie publication en base depuis le formulaire
- upload réel des photos dans Supabase Storage
- commentaires partagés depuis le site
- interface admin
- modération réelle
- buckets Storage
- policies Storage

---

## 11. Prochaine étape recommandée

Prochaine étape technique :

Créer et tester Supabase Storage avec prudence.

Objectif :

- créer un bucket `report-photos`
- comprendre les règles d’accès
- tester un upload manuel
- ne pas encore brancher le site dessus

Alternative prudente :

Avant Storage, relire les policies RLS et vérifier que les tables sont correctement sécurisées.

---

## 12. Rappel important

La V1.2 reste la version stable en ligne.

Supabase est préparé en arrière-plan pour la V2.

Aucune modification du site public ne doit être faite sans test local et sans backup.
