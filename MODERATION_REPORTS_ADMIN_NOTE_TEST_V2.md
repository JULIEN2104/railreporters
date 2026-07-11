# RailReporters — Test note interne admin V2

## Objectif

Ce document garde une trace du test local de la fonction :

`Note interne admin`

dans :

`Espace admin RailReporters → Signalements`

La V2 beta publique est actuellement en ligne sur :

`railreporters.com`

La fonction a été testée localement avant toute mise en ligne.

---

## 1. But du test

Vérifier qu’un administrateur peut enregistrer une note privée liée à un signalement.

La note doit :

- être associée au bon signalement ;
- être conservée après rechargement ;
- pouvoir être modifiée ;
- rester indépendante du statut du signalement ;
- rester invisible aux membres et aux visiteurs.

---

## 2. Table utilisée

La note interne est enregistrée dans la table :

`moderation_report_admin_notes`

Cette table est séparée de :

`moderation_reports`

afin d’éviter qu’un membre autorisé à lire ses propres signalements puisse récupérer une note interne administrateur.

---

## 3. Structure de la note

Champs principaux utilisés :

- `id`;
- `moderation_report_id`;
- `note`;
- `created_by`;
- `updated_by`;
- `created_at`;
- `updated_at`.

Relation principale :

`moderation_reports.id → moderation_report_admin_notes.moderation_report_id`

Une seule note est associée à chaque signalement dans cette première version.

---

## 4. Sécurité de la table

RLS est activé sur :

`moderation_report_admin_notes`

Policies vérifiées :

- Moderators and admins can create moderation report admin notes ;
- Moderators and admins can read moderation report admin notes ;
- Moderators and admins can update moderation report admin notes.

Rôle PostgreSQL concerné :

`authenticated`

La condition réelle d’accès vérifie que l’utilisateur est admin ou modérateur.

Aucun droit anonyme n’est accordé.

Aucune suppression depuis le frontend n’est autorisée dans cette première version.

---

## 5. Test de création

Compte utilisé :

`julien`

Rôle :

`admin`

Test réalisé :

1. écrire une note interne ;
2. cliquer sur `Enregistrer la note`;
3. vérifier le message de confirmation ;
4. vérifier qu’une ligne apparaît dans Supabase.

Résultat :

`Note interne enregistrée.`

Statut : validé localement.

---

## 6. Test après rechargement

Après enregistrement :

1. recharger la page locale ;
2. se reconnecter si nécessaire ;
3. ouvrir l’espace admin ;
4. retrouver le même signalement.

Résultat :

- la note est toujours présente ;
- le texte est correctement rechargé ;
- la note reste liée au bon signalement.

Statut : validé localement.

---

## 7. Test de modification

Une note existante a été modifiée.

Action :

`Mettre à jour la note`

Résultat :

- le texte est mis à jour ;
- la ligne existante est modifiée ;
- aucune deuxième note n’est créée ;
- la date de modification est actualisée ;
- l’auteur de la modification est conservé.

Statut : validé localement.

---

## 8. Indépendance du statut

L’enregistrement ou la modification d’une note ne change pas automatiquement :

- `moderation_reports.status`;
- `moderation_reports.reviewed_at`;
- le statut du report signalé ;
- le statut du commentaire signalé ;
- le statut de l’utilisateur.

Les actions suivantes restent séparées :

- Marquer comme examiné ;
- Rejeter ;
- Action effectuée ;
- Masquer le contenu signalé.

Statut : validé localement.

---

## 9. Limite de longueur

La note est limitée à :

`1000 caractères`

Cette limite est contrôlée :

- dans l’interface ;
- par une contrainte PostgreSQL.

Une note vide ne doit pas être enregistrée.

---

## 10. Test membre

Avec un compte `member` :

- l’espace admin n’apparaît pas ;
- la note interne n’apparaît pas ;
- aucune action d’enregistrement n’est visible ;
- la table des notes ne doit retourner aucune ligne au membre.

Statut : validé localement.

---

## 11. Test visiteur

Avec un visiteur non connecté :

- l’espace admin n’apparaît pas ;
- les signalements admin ne sont pas visibles ;
- les notes internes ne sont pas visibles ;
- aucun accès anonyme à la table n’est autorisé.

Statut : validé localement.

---

## 12. Informations interdites

Les notes internes ne doivent jamais contenir :

- mot de passe ;
- token ;
- clé privée ;
- clé service_role ;
- donnée Auth sensible ;
- information personnelle inutile.

Les notes doivent rester factuelles et liées à la modération.

---

## 13. Ce que ce test valide

RailReporters peut maintenant :

- enregistrer une note privée sur un signalement ;
- recharger la note après actualisation ;
- modifier une note existante ;
- afficher la dernière modification ;
- conserver la note indépendamment du statut ;
- protéger la note avec RLS ;
- empêcher les membres et visiteurs de la consulter.

---

## 14. Ce que ce test ne fait pas encore

Non encore fait :

- mise en ligne de la fonction ;
- historique de toutes les anciennes versions de la note ;
- plusieurs notes par signalement ;
- suppression de note depuis l’interface ;
- notification admin ;
- export d’un historique de modération.

---

## 15. Décision actuelle

Note interne admin : validée localement.

Statut :

`note admin locale OK`

Prochaine étape :

`Vérifier les fichiers actuels puis mettre en ligne la note interne admin.`
