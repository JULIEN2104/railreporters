# RailReporters — Supabase Next Steps

## Objectif

Ce document sert de checklist avant d’exécuter le script SQL V2 dans Supabase.

Le fichier `SUPABASE_SCHEMA_V2.sql` existe déjà dans GitHub, mais il ne doit pas être exécuté sans vérification finale.

La V1.2 actuelle de RailReporters reste la version stable en ligne.

---

## 1. Règle principale

Ne pas brancher immédiatement le site V1.2 à Supabase.

La V1.2 doit rester stable pendant la préparation de la V2.

---

## 2. État actuel

Supabase :

- projet `railreporters` retrouvé ;
- projet actif ;
- statut Healthy ;
- Table Editor repéré ;
- SQL Editor repéré ;
- base principale disponible.

GitHub :

- README.md créé ;
- VERSION.txt créé ;
- CAHIER_DES_CHARGES_V2.md créé ;
- SCHEMA_DATABASE_V2.md créé ;
- PLAN_MIGRATION_V2.md créé ;
- SUPABASE_SCHEMA_V2.sql créé.

Site :

- railreporters.com fonctionne ;
- www.railreporters.com fonctionne ;
- railreporters.fr redirige vers railreporters.com ;
- V1.2 stable.

---

## 3. Avant d’exécuter le SQL

Vérifier :

- que le projet Supabase est le bon ;
- que le script SQL correspond bien au schéma prévu ;
- que les tables essentielles sont correctement définies ;
- que les politiques RLS sont présentes ;
- que les fonctions de rôle ne créent pas de conflit ;
- que la table `profiles` est bien liée à `auth.users` ;
- que les buckets Storage ne sont pas encore créés trop tôt.

---

## 4. Ce qu’il ne faut pas faire maintenant

Ne pas encore :

- connecter railreporters.com à Supabase ;
- remplacer localStorage par Supabase ;
- activer la publication réelle en base ;
- connecter le formulaire en ligne à la base ;
- créer les buckets photos sans réflexion ;
- publier des clés Supabase privées ;
- modifier le site stable sans backup.

---

## 5. Première exécution SQL recommandée

Quand on sera prêt, commencer par une première exécution contrôlée du SQL.

Ordre recommandé :

1. créer les extensions ;
2. créer `profiles` ;
3. créer `reports` ;
4. créer `report_sections`;
5. créer `report_photos`;
6. créer `comments`;
7. ajouter les index ;
8. ajouter les triggers `updated_at`;
9. ajouter le trigger de création automatique de profil ;
10. activer RLS ;
11. ajouter les policies.

Ne pas commencer par Storage.

---

## 6. Test après création des tables

Après exécution SQL, vérifier dans Table Editor :

- table `profiles` visible ;
- table `reports` visible ;
- table `report_sections` visible ;
- table `report_photos` visible ;
- table `comments` visible ;
- RLS activé sur les tables ;
- aucune erreur SQL.

---

## 7. Authentification

Étape suivante après les tables :

- activer l’inscription email ;
- créer un compte de test ;
- vérifier qu’un profil est automatiquement créé ;
- vérifier que le rôle par défaut est `member` ;
- préparer un compte administrateur.

---

## 8. Compte administrateur

Il faudra définir ton compte comme administrateur.

Objectif :

- pouvoir modérer ;
- masquer les contenus ;
- gérer les signalements ;
- supprimer les contenus inadaptés ;
- gérer les utilisateurs problématiques.

Action prévue :

- créer ton compte utilisateur ;
- modifier ton rôle dans `profiles` en `admin`.

---

## 9. Stockage photo

À faire seulement après les premiers tests Auth + Database.

Buckets envisagés :

- `report-photos`
- `profile-avatars`

À vérifier avant création :

- public ou privé ;
- règles d’upload ;
- règles de lecture ;
- règles de suppression ;
- taille maximale ;
- compression avant upload.

---

## 10. Connexion du site à Supabase

À faire seulement après validation des tables, Auth et Storage.

Étapes :

1. récupérer l’URL publique du projet Supabase ;
2. récupérer la clé anon publique ;
3. ajouter le client Supabase au site ;
4. tester en local ;
5. ne pas exposer de clé secrète ;
6. publier sur GitHub seulement après test local.

---

## 11. Migration du formulaire

Le formulaire de publication devra évoluer.

Aujourd’hui :

- création dans localStorage ;
- photos stockées en base64 dans le navigateur.

V2 :

- utilisateur connecté requis ;
- photos compressées puis uploadées ;
- report enregistré en base ;
- sections enregistrées en base ;
- URLs photos enregistrées en base ;
- report visible par tous.

---

## 12. Migration des commentaires

Aujourd’hui :

- commentaires en localStorage.

V2 :

- commentaires en table `comments`;
- membre connecté requis ;
- commentaires visibles par tous ;
- modération possible.

---

## 13. Risques principaux

Risques :

- casser la V1.2 ;
- publier des clés privées ;
- désactiver la sécurité RLS ;
- rendre les brouillons publics ;
- permettre à un utilisateur de modifier un report d’un autre ;
- stocker trop de photos lourdes ;
- créer trop de fonctionnalités en même temps.

Solutions :

- backup local avant chaque changement ;
- tester localement ;
- valider une étape à la fois ;
- utiliser GitHub pour tracer les changements ;
- garder VERSION.txt à jour.

---

## 14. Ordre recommandé de travail

1. Conserver V1.2 stable.
2. Préparer Supabase.
3. Exécuter le SQL après validation.
4. Créer un compte test.
5. Créer ton compte admin.
6. Tester les tables.
7. Créer les buckets photos.
8. Tester un upload photo.
9. Tester un report Supabase local.
10. Brancher progressivement le site.
11. Publier seulement quand tout est stable.

---

## 15. Décision actuelle

Ne pas exécuter le SQL immédiatement sans validation finale.

La prochaine étape sera :

- relire `SUPABASE_SCHEMA_V2.sql`;
- décider si on exécute tout le script ou seulement les premières tables ;
- faire un backup mental/documentaire clair avant action.
