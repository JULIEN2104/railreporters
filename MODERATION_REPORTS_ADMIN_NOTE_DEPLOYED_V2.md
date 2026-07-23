# RailReporters — Note interne admin déployée V2

## Objectif

Ce document confirme que la fonction :

`Note interne admin`

est maintenant déployée en ligne dans :

`Espace admin RailReporters → Signalements`

Domaine concerné :

`railreporters.com`

---

## 1. Statut général

La fonction de note interne administrateur est en ligne.

Statut :

`validé`

---

## 2. Fonction disponible

Dans chaque signalement, l’administrateur dispose maintenant de :

- une zone de texte `Note interne admin`;
- un bouton `Enregistrer la note`;
- un bouton `Mettre à jour la note` lorsqu’une note existe déjà ;
- la date de dernière modification ;
- l’auteur de la dernière modification.

---

## 3. Table utilisée

Les notes internes sont enregistrées dans la table privée :

`moderation_report_admin_notes`

Cette table est séparée de :

`moderation_reports`

afin de ne pas exposer les notes internes aux membres autorisés à consulter leurs propres signalements.

---

## 4. Relation avec le signalement

Chaque note est liée à un signalement grâce à :

`moderation_reports.id → moderation_report_admin_notes.moderation_report_id`

Dans cette première version :

`un signalement = une note interne modifiable`

La note existante est mise à jour au lieu de créer un doublon.

---

## 5. Structure principale

Champs utilisés :

- `id`;
- `moderation_report_id`;
- `note`;
- `created_by`;
- `updated_by`;
- `created_at`;
- `updated_at`.

La longueur de la note est limitée à :

`1000 caractères`

Une note vide ne peut pas être enregistrée.

---

## 6. Test de création en ligne

Compte utilisé :

`julien`

Rôle :

`admin`

Test réalisé :

1. ouvrir l’espace admin ;
2. ouvrir la zone Signalements ;
3. écrire une note interne ;
4. cliquer sur `Enregistrer la note`;
5. vérifier le message de réussite.

Résultat :

`Note interne enregistrée.`

Statut :

`validé en ligne`

---

## 7. Test après rechargement

Après enregistrement :

1. recharger `railreporters.com`;
2. se reconnecter si nécessaire ;
3. revenir dans l’espace admin ;
4. retrouver le même signalement.

Résultat :

- la note est toujours présente ;
- elle reste liée au bon signalement ;
- le texte enregistré est correctement rechargé.

Statut :

`validé en ligne`

---

## 8. Test de modification

Une note existante peut être modifiée.

Action :

`Mettre à jour la note`

Résultat :

- la ligne existante est modifiée ;
- aucune deuxième note n’est créée ;
- la nouvelle valeur reste présente après rechargement ;
- la date de dernière modification est actualisée ;
- l’auteur de la modification est conservé.

Statut :

`validé en ligne`

---

## 9. Indépendance du statut

La création ou la modification d’une note ne modifie pas automatiquement :

- `moderation_reports.status`;
- `moderation_reports.reviewed_at`;
- le statut du report signalé ;
- le statut du commentaire signalé ;
- le statut de l’utilisateur concerné.

Les actions suivantes restent indépendantes :

- Marquer comme examiné ;
- Rejeter ;
- Action effectuée ;
- Masquer le contenu signalé ;
- Bannir ou débannir un membre.

Statut :

`validé`

---

## 10. Actions admin conservées

Les fonctions suivantes continuent de fonctionner :

- Voir le contenu ;
- Retour aux signalements ;
- Masquer le report signalé ;
- Masquer le commentaire signalé ;
- Marquer comme examiné ;
- Rejeter ;
- Action effectuée ;
- Restaurer un report ;
- Restaurer un commentaire.

Statut :

`validé en ligne`

---

## 11. RLS

RLS est activé sur :

`moderation_report_admin_notes`

Policies présentes :

- `Moderators and admins can create moderation report admin notes`;
- `Moderators and admins can read moderation report admin notes`;
- `Moderators and admins can update moderation report admin notes`.

Rôle PostgreSQL utilisé par un utilisateur connecté :

`authenticated`

La condition réelle d’accès vérifie que l’utilisateur est administrateur ou modérateur.

---

## 12. Privilèges

Les droits frontend sont limités aux opérations nécessaires :

- lecture ;
- création ;
- modification de la note.

Aucun droit anonyme n’est accordé.

Aucune suppression frontend n’est autorisée dans cette première version.

---

## 13. Test membre

Avec un compte `member` :

- l’espace admin n’apparaît pas ;
- les signalements admin ne sont pas visibles ;
- les notes internes ne sont pas visibles ;
- aucune action d’enregistrement ou de modification n’est disponible.

Statut :

`validé en ligne`

---

## 14. Test visiteur

Avec un visiteur non connecté :

- l’espace admin n’apparaît pas ;
- aucune note interne n’est visible ;
- aucun accès anonyme à la table n’est autorisé.

Statut :

`validé en ligne`

---

## 15. Données interdites

Les notes internes ne doivent jamais contenir :

- mot de passe ;
- token ;
- clé secrète ;
- clé `service_role`;
- information Auth sensible ;
- information personnelle inutile.

Les notes doivent rester factuelles et strictement liées à la modération.

---

## 16. Ancienne colonne admin_note

La colonne existante :

`moderation_reports.admin_note`

reste présente pour le moment.

Les nouvelles notes confidentielles ne sont pas enregistrées dans cette colonne.

Elles sont stockées uniquement dans :

`moderation_report_admin_notes`

Décision :

- ne pas utiliser l’ancienne colonne pour des informations confidentielles ;
- ne pas la supprimer immédiatement ;
- examiner son retrait éventuel lors d’un futur nettoyage de schéma.

---

## 17. Ce que cette fonction valide

RailReporters peut maintenant :

- conserver une note interne privée sur un signalement ;
- recharger la note après actualisation ;
- modifier la note existante ;
- afficher sa dernière modification ;
- identifier l’administrateur ayant modifié la note ;
- conserver la note indépendamment des actions de modération ;
- empêcher les membres et visiteurs de la consulter.

---

## 18. Ce que cette fonction ne fait pas encore

Non encore fait :

- plusieurs notes par signalement ;
- historique de toutes les anciennes versions ;
- suppression d’une note depuis l’interface ;
- journal complet des actions admin ;
- notification à un autre modérateur ;
- export de l’historique de modération.

---

## 19. Améliorations futures possibles

À préparer plus tard :

- historique des actions de modération ;
- plusieurs notes chronologiques ;
- identification de chaque administrateur intervenu ;
- filtre par administrateur ;
- recherche dans les notes ;
- export d’un dossier de modération ;
- suppression contrôlée d’une note ;
- rôle `moderator`.

---

## 20. Décision actuelle

La fonction Note interne admin est déployée et validée.

Statut :

`Moderation report private admin note deployed — OK`
