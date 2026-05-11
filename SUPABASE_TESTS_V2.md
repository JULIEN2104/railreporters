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
- Authentication : accessible
- Storage : accessible

Statut : validé.

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

Données initiales utilisées :

- report_id : id du report de test
- section_id : id de la section de test
- user_id : id du profil admin
- photo_url : https://example.com/test-photo.jpg
- caption : Photo de test Supabase
- position : 1

Ensuite, l’URL fictive a été remplacée par une vraie URL publique Supabase Storage.

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

Statut : validé.

---

## 10. Supabase Storage

Un bucket Storage a été créé :

- bucket : report-photos
- type : public

Une image de test a été uploadée manuellement dans ce bucket.

L’URL publique de l’image a été récupérée, testée dans un navigateur, puis ajoutée dans la table `report_photos`.

Résultat :

- bucket créé
- image uploadée
- URL publique fonctionnelle
- URL enregistrée dans `report_photos`

Statut : validé.

---

## 11. Ce que le test Storage confirme

Le test Storage valide la logique future suivante :

1. l’utilisateur choisit une photo ;
2. le site compresse la photo ;
3. le site envoie la photo dans Supabase Storage ;
4. Supabase fournit une URL publique ou une URL utilisable ;
5. le site enregistre cette URL dans `report_photos` ;
6. le report affiche la photo depuis cette URL.

Pour l’instant, ce processus a été testé manuellement.

Le site public `railreporters.com` n’est pas encore connecté à Supabase Storage.

---

## 12. Ce qui n’est pas encore fait

Non encore réalisé :

- connexion du site railreporters.com à Supabase
- inscription / connexion depuis le site
- vraie publication en base depuis le formulaire
- upload réel des photos depuis le formulaire public
- récupération automatique des URLs Storage depuis le site
- commentaires partagés depuis le site
- interface admin
- modération réelle
- policies Storage détaillées
- suppression photo depuis le site
- migration complète de localStorage vers Supabase

---

## 13. Prochaine étape recommandée

Prochaine étape technique :

Préparer les règles Storage et la logique d’upload contrôlé.

Objectifs :

- contrôler qui peut uploader ;
- contrôler qui peut supprimer ;
- limiter l’upload aux utilisateurs connectés ;
- lier une photo à un report appartenant à l’utilisateur ;
- conserver le bucket `report-photos` comme bucket public au départ ;
- ne pas encore brancher le site sans test local.

Alternative prudente :

Avant de brancher le site, créer un document `STORAGE_POLICIES_V2.md` pour préparer les règles d’accès.

---

## 14. Rappel important

La V1.2 reste la version stable en ligne.

Supabase est préparé en arrière-plan pour la V2.

Aucune modification du site public ne doit être faite sans test local et sans backup.
