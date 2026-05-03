# RailReporters — Schéma de base de données V2

## Objectif

Ce document prépare la future version communautaire de RailReporters.

La V1.2 actuelle fonctionne comme prototype :
- site en ligne ;
- reports créables ;
- photos ;
- commentaires ;
- recherche ;
- formulaire amélioré ;
- sauvegarde locale dans le navigateur.

Mais les reports sont encore stockés dans le navigateur de chaque utilisateur avec `localStorage`.

La V2 doit transformer RailReporters en vraie plateforme communautaire avec :
- comptes utilisateurs ;
- reports visibles par tous ;
- commentaires partagés ;
- stockage serveur des photos ;
- modération ;
- rôles administrateur / modérateur / membre.

---

# 1. Table `profiles`

## Rôle

La table `profiles` contient les informations publiques des utilisateurs.

Elle sera liée aux comptes d’authentification Supabase.

## Champs prévus

| Champ | Type | Description |
|---|---|---|
| id | uuid | Identifiant utilisateur, lié à auth.users |
| username | text | Pseudo public |
| avatar_url | text | Photo de profil |
| bio | text | Présentation courte |
| country | text | Pays optionnel |
| city | text | Ville optionnelle |
| role | text | member, moderator, admin |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de mise à jour |

## Règles générales

- Un utilisateur peut lire les profils publics.
- Un utilisateur peut modifier uniquement son propre profil.
- L’administrateur peut modifier ou bloquer un profil si nécessaire.

---

# 2. Table `reports`

## Rôle

La table `reports` contient les reports principaux publiés par les membres.

## Champs prévus

| Champ | Type | Description |
|---|---|---|
| id | uuid | Identifiant unique du report |
| user_id | uuid | Auteur du report |
| title | text | Titre du report |
| train | text | Nom du train |
| operator | text | Opérateur ferroviaire |
| departure_station | text | Gare de départ |
| departure_time | time | Heure de départ |
| arrival_station | text | Gare d’arrivée |
| arrival_time | time | Heure d’arrivée |
| travel_date | date | Date du voyage |
| travel_class | text | Classe du voyage |
| cover_photo_url | text | Photo d’accueil |
| rating | integer | Note globale |
| conclusion | text | Conclusion du report |
| status | text | draft, published, hidden, deleted |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de mise à jour |

## Statuts possibles

- `draft` : brouillon
- `published` : publié
- `hidden` : masqué par modération
- `deleted` : supprimé

## Règles générales

- Tout le monde peut lire les reports publiés.
- Un membre connecté peut créer un report.
- Un utilisateur peut modifier ses propres reports.
- Un administrateur peut masquer ou supprimer n’importe quel report.

---

# 3. Table `report_sections`

## Rôle

La table `report_sections` contient les étapes détaillées d’un report.

Exemples :
- arrivée en gare ;
- expérience en gare ;
- embarquement ;
- à bord du train ;
- services à bord ;
- arrivée à destination.

## Champs prévus

| Champ | Type | Description |
|---|---|---|
| id | uuid | Identifiant unique de la section |
| report_id | uuid | Report associé |
| section_type | text | Type de section |
| title | text | Titre affiché |
| content | text | Texte de la section |
| position | integer | Ordre d’affichage |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de mise à jour |

## Types de sections possibles

- `station_arrival`
- `station_experience`
- `boarding`
- `onboard`
- `services`
- `arrival`
- `conclusion`

## Règles générales

- Les sections sont liées à un report.
- L’auteur du report peut créer, modifier ou supprimer ses sections.
- Les visiteurs peuvent lire les sections des reports publiés.

---

# 4. Table `report_photos`

## Rôle

La table `report_photos` contient les photos liées aux reports et aux sections.

## Champs prévus

| Champ | Type | Description |
|---|---|---|
| id | uuid | Identifiant unique de la photo |
| report_id | uuid | Report associé |
| section_id | uuid | Section associée, optionnelle |
| user_id | uuid | Auteur de la photo |
| photo_url | text | URL de la photo dans le stockage |
| caption | text | Légende optionnelle |
| position | integer | Ordre d’affichage |
| created_at | timestamp | Date d’ajout |

## Règles générales

- Une photo peut être liée au report global ou à une section.
- L’auteur peut gérer ses propres photos.
- L’administrateur peut supprimer une photo inadaptée.
- Les photos doivent être compressées avant l’envoi.

---

# 5. Table `comments`

## Rôle

La table `comments` contient les commentaires publiés sous les reports.

## Champs prévus

| Champ | Type | Description |
|---|---|---|
| id | uuid | Identifiant unique du commentaire |
| report_id | uuid | Report concerné |
| user_id | uuid | Auteur du commentaire |
| parent_comment_id | uuid | Commentaire parent, pour les réponses |
| content | text | Texte du commentaire |
| status | text | published, hidden, deleted |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de mise à jour |

## Règles générales

- Tout le monde peut lire les commentaires publiés.
- Un membre connecté peut commenter.
- Un utilisateur peut éventuellement supprimer ses propres commentaires.
- L’administrateur peut masquer ou supprimer tout commentaire abusif.

---

# 6. Table `moderation_reports`

## Rôle

La table `moderation_reports` contient les signalements faits par les utilisateurs.

## Champs prévus

| Champ | Type | Description |
|---|---|---|
| id | uuid | Identifiant du signalement |
| reported_by | uuid | Utilisateur qui signale |
| content_type | text | report, comment, photo, profile |
| content_id | uuid | Identifiant du contenu signalé |
| reason | text | Raison du signalement |
| details | text | Détails optionnels |
| status | text | pending, reviewed, rejected, action_taken |
| admin_note | text | Note interne de modération |
| created_at | timestamp | Date du signalement |
| reviewed_at | timestamp | Date de traitement |

## Raisons possibles

- insultes ;
- propos sexistes ;
- propos discriminatoires ;
- spam ;
- photo inadaptée ;
- contenu hors sujet ;
- harcèlement ;
- autre.

## Règles générales

- Un membre peut signaler un contenu.
- L’administrateur peut traiter les signalements.
- Les signalements ne sont pas publics.

---

# 7. Table `user_bans`

## Rôle

La table `user_bans` permet de gérer les utilisateurs bloqués ou bannis.

## Champs prévus

| Champ | Type | Description |
|---|---|---|
| id | uuid | Identifiant du bannissement |
| user_id | uuid | Utilisateur concerné |
| banned_by | uuid | Administrateur ou modérateur |
| reason | text | Raison |
| starts_at | timestamp | Début |
| ends_at | timestamp | Fin si temporaire |
| is_permanent | boolean | Bannissement définitif |
| created_at | timestamp | Date de création |

## Règles générales

- Seuls les administrateurs et modérateurs peuvent bannir.
- Un utilisateur banni ne peut pas publier ni commenter.
- Un bannissement peut être temporaire ou définitif.

---

# 8. Table `saved_reports`

## Rôle

Cette table permettra aux utilisateurs de sauvegarder des reports favoris.

## Champs prévus

| Champ | Type | Description |
|---|---|---|
| id | uuid | Identifiant |
| user_id | uuid | Utilisateur |
| report_id | uuid | Report sauvegardé |
| created_at | timestamp | Date d’ajout |

## Règles générales

- Un membre connecté peut sauvegarder un report.
- Un membre peut retirer un report de ses favoris.
- Cette fonction n’est pas prioritaire pour la première V2.

---

# 9. Table `report_likes` ou `report_reactions`

## Rôle

Cette table pourra servir plus tard pour les réactions ou likes.

## Champs prévus

| Champ | Type | Description |
|---|---|---|
| id | uuid | Identifiant |
| user_id | uuid | Utilisateur |
| report_id | uuid | Report concerné |
| reaction_type | text | like, useful, thanks |
| created_at | timestamp | Date |

## Note

Cette fonctionnalité n’est pas prioritaire.

Pour l’instant, les commentaires sont plus importants que les réactions rapides.

---

# 10. Stockage des photos

Les photos ne doivent plus être stockées dans `localStorage`.

Elles devront être stockées dans un service serveur, par exemple Supabase Storage.

## Buckets envisagés

### `report-photos`

Pour les photos des reports.

### `profile-avatars`

Pour les photos de profil.

## Règles générales

- Les photos doivent être compressées avant l’envoi.
- Les photos doivent avoir une taille maximale.
- Les utilisateurs peuvent supprimer leurs propres photos.
- L’administrateur peut supprimer les photos inadaptées.
- Les photos des reports publiés doivent être lisibles publiquement ou via URL contrôlée.

---

# 11. Règles de sécurité générales

La future base devra utiliser des règles de sécurité.

## Objectifs

- empêcher un utilisateur de modifier le report d’un autre ;
- empêcher un utilisateur de supprimer les commentaires d’un autre ;
- permettre à l’administrateur de modérer ;
- permettre aux visiteurs de lire les reports publiés ;
- protéger les brouillons ;
- protéger les données privées.

## Règles simplifiées

### Reports

- Lecture publique si `status = published`
- Création par utilisateur connecté
- Modification par l’auteur
- Modération par admin ou modérateur

### Comments

- Lecture publique si `status = published`
- Création par utilisateur connecté
- Suppression / masquage par admin ou modérateur

### Profiles

- Lecture publique des informations utiles
- Modification uniquement par le propriétaire du profil
- Gestion rôle uniquement par admin

### Photos

- Lecture selon statut du report
- Upload par utilisateur connecté
- Suppression par auteur ou admin

---

# 12. Priorités de création des tables

## Phase 1

Créer les tables essentielles :

1. `profiles`
2. `reports`
3. `report_sections`
4. `report_photos`
5. `comments`

## Phase 2

Ajouter la modération :

6. `moderation_reports`
7. `user_bans`

## Phase 3

Ajouter les fonctionnalités secondaires :

8. `saved_reports`
9. `report_reactions`

---

# 13. Ce qu’on ne fait pas tout de suite

À ne pas faire immédiatement :

- paiements ;
- publicités ;
- marketplace ;
- newsletter ;
- application mobile native ;
- système complexe de badges ;
- statistiques avancées ;
- carte ferroviaire réelle mondiale ;
- traduction anglaise complète.

---

# 14. Objectif technique

La V2 doit être :

- propre ;
- transférable ;
- documentée ;
- sécurisée ;
- compréhensible par un développeur ;
- compatible avec une future revente du projet.

Le code et la base de données doivent être organisés pour qu’un acheteur ou un développeur puisse reprendre le projet facilement.
