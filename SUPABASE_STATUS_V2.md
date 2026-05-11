# RailReporters — Statut Supabase V2

## Objectif

Ce document résume l’état actuel de la préparation Supabase pour la V2 communautaire de RailReporters.

La V1.2 du site reste stable, en ligne, et indépendante de Supabase pour l’instant.

---

## 1. Statut général

Supabase est en préparation pour la V2.

État actuel :

- projet Supabase `railreporters` retrouvé ;
- projet actif ;
- statut Healthy ;
- Table Editor accessible ;
- SQL Editor accessible ;
- Authentication accessible ;
- Storage accessible.

Statut : validé.

---

## 2. Site actuel

La V1.2 reste la version stable en ligne.

Domaines :

- https://railreporters.com
- https://www.railreporters.com
- https://railreporters.fr redirige vers https://railreporters.com

Important :

Le site public n’est pas encore connecté à Supabase.

La V1.2 utilise encore `localStorage`.

---

## 3. Documentation GitHub créée

Documents existants :

- README.md
- VERSION.txt
- CAHIER_DES_CHARGES_V2.md
- SCHEMA_DATABASE_V2.md
- PLAN_MIGRATION_V2.md
- SUPABASE_SCHEMA_V2.sql
- SUPABASE_NEXT_STEPS.md
- STORAGE_PLAN_V2.md
- STORAGE_POLICIES_V2.md
- SUPABASE_TESTS_V2.md

Statut : validé.

---

## 4. SQL V2

Le fichier SQL suivant existe dans GitHub :

`SUPABASE_SCHEMA_V2.sql`

Le script a été exécuté dans Supabase.

Tables créées :

- profiles
- reports
- report_sections
- report_photos
- comments
- moderation_reports
- user_bans

Statut : validé.

---

## 5. Authentification

Un utilisateur test a été créé dans :

Authentication → Users

Résultat :

- utilisateur visible dans Supabase Auth ;
- profil automatiquement créé dans `profiles`.

Statut : validé.

---

## 6. Profil utilisateur

Table concernée :

`profiles`

Résultat :

- ligne créée automatiquement après création de l’utilisateur Auth ;
- rôle par défaut : member ;
- rôle modifié ensuite en admin ;
- is_banned : false.

Statut : validé.

---

## 7. Compte administrateur

Le profil test a été passé en :

`admin`

Objectif :

- préparer la future modération ;
- permettre la gestion des reports ;
- permettre la gestion des commentaires ;
- préparer les futures règles admin.

Statut : validé.

---

## 8. Reports

Table concernée :

`reports`

Un report de test a été créé manuellement.

Données principales :

- title : Test Supabase RailReporters
- train : TGV INOUI
- operator : SNCF
- departure_station : Paris Gare de Lyon
- arrival_station : Lyon Part-Dieu
- rating : 5
- status : published

Relation validée :

`profiles.id → reports.user_id`

Statut : validé.

---

## 9. Sections de report

Table concernée :

`report_sections`

Une section de test a été créée.

Données principales :

- section_type : station_arrival
- title : Arrivée en gare
- content : Test de section liée au report Supabase.
- position : 1

Relation validée :

`reports.id → report_sections.report_id`

La contrainte `section_type` a été testée.

Statut : validé.

---

## 10. Commentaires

Table concernée :

`comments`

Un commentaire de test a été créé.

Relations validées :

- `reports.id → comments.report_id`
- `profiles.id → comments.user_id`

Statut : validé.

---

## 11. Photos de report

Table concernée :

`report_photos`

Une photo de test a été créée.

Relations validées :

- `reports.id → report_photos.report_id`
- `report_sections.id → report_photos.section_id`
- `profiles.id → report_photos.user_id`

Statut : validé.

---

## 12. Supabase Storage

Bucket créé :

`report-photos`

Type :

public

Tests réalisés :

- image uploadée manuellement ;
- URL publique récupérée ;
- URL testée dans un navigateur ;
- URL enregistrée dans `report_photos`.

Statut : validé.

---

## 13. Ce qui est validé techniquement

Validé :

- création des tables ;
- création utilisateur Auth ;
- création automatique du profil ;
- rôle admin ;
- création report ;
- création section ;
- création commentaire ;
- création photo de test ;
- bucket Storage public ;
- upload manuel Storage ;
- URL publique Storage ;
- documentation GitHub.

---

## 14. Ce qui n’est pas encore fait

Non encore fait :

- connecter railreporters.com à Supabase ;
- activer l’inscription depuis le site ;
- activer la connexion depuis le site ;
- publier un report depuis le site vers Supabase ;
- uploader une photo depuis le site vers Supabase Storage ;
- lire les reports depuis Supabase dans le site ;
- lire les commentaires depuis Supabase dans le site ;
- créer une interface admin ;
- activer une vraie modération depuis le site ;
- créer les policies Storage définitives ;
- migrer la V1.2 vers une vraie V2.

---

## 15. Points de prudence

À ne pas faire maintenant sans préparation :

- ne pas modifier railreporters.com directement ;
- ne pas supprimer les tables ;
- ne pas relancer inutilement le script SQL complet ;
- ne pas exposer de clé privée Supabase ;
- ne pas connecter le formulaire public sans test local ;
- ne pas créer trop de fonctionnalités en même temps.

---

## 16. Prochaine étape recommandée

Prochaine étape possible :

Créer et tester progressivement les policies Storage.

Avant cela, il faudra :

- relire `STORAGE_POLICIES_V2.md`;
- vérifier les règles Supabase Storage ;
- tester avec prudence ;
- ne pas brancher le site public.

Alternative prudente :

Commencer par préparer la connexion Auth côté site en local, sans publier en production.

---

## 17. Décision actuelle

RailReporters V1.2 reste la version stable publique.

Supabase est préparé en arrière-plan pour la V2.

La V2 ne doit être connectée au site qu’après tests locaux complets.
