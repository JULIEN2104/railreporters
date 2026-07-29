# RailReporters — Test historique de modération des reports V2

## Objectif

Ce document garde une trace du premier test local de l’historique des actions de modération RailReporters.

La V2 beta publique est actuellement en ligne sur :

`railreporters.com`

La première intégration de l’historique a été testée localement avant toute mise en ligne.

---

## 1. But du test

Vérifier que RailReporters peut enregistrer une entrée dans l’historique après une action de modération réussie sur un report.

Actions testées :

- masquer un report ;
- restaurer un report.

La table utilisée est :

`moderation_action_history`

---

## 2. Table d’historique

Table Supabase :

`moderation_action_history`

Champs principaux utilisés :

- `id`;
- `actor_id`;
- `action_type`;
- `target_type`;
- `target_id`;
- `moderation_report_id`;
- `previous_status`;
- `new_status`;
- `reason`;
- `metadata`;
- `created_at`.

Cette table fonctionne comme un journal ajouté progressivement.

Les anciennes entrées ne peuvent pas être modifiées ou supprimées depuis le frontend.

---

## 3. Sécurité de la table

RLS est activé sur :

`moderation_action_history`

Policies présentes :

- `Moderators and admins can create moderation action history`;
- `Moderators and admins can read moderation action history`.

Les rôles frontend disposent uniquement des privilèges nécessaires.

Résultat vérifié :

`anon`

- SELECT : non ;
- INSERT : non ;
- UPDATE : non ;
- DELETE : non.

`authenticated`

- SELECT : oui ;
- INSERT : oui ;
- UPDATE : non ;
- DELETE : non.

Les policies RLS limitent ensuite la lecture et la création aux administrateurs ou futurs modérateurs non bannis.

---

## 4. Test — Masquer un report

Compte utilisé :

`julien`

Rôle :

`admin`

Action réalisée :

`Masquer ce report`

Modification du report :

`reports.status = hidden`

Entrée historique attendue :

- `action_type = report_hidden`;
- `target_type = report`;
- `target_id = id du report`;
- `previous_status = published`;
- `new_status = hidden`;
- `actor_id = id du compte admin`;
- `created_at = date de l’action`.

Résultat :

- le report a été masqué ;
- le report a disparu de l’affichage public ;
- une ligne a été ajoutée dans `moderation_action_history`;
- l’ancien et le nouveau statut ont été enregistrés.

Statut :

`validé localement`

---

## 5. Test — Restaurer un report

Action réalisée :

`Restaurer ce report`

Modification du report :

`reports.status = published`

Entrée historique attendue :

- `action_type = report_restored`;
- `target_type = report`;
- `target_id = id du report`;
- `previous_status = hidden`;
- `new_status = published`;
- `actor_id = id du compte admin`;
- `created_at = date de l’action`.

Résultat :

- le report a été restauré ;
- le report a réapparu dans `Derniers reports`;
- une deuxième ligne a été ajoutée dans l’historique ;
- la première entrée de masquage est restée intacte.

Statut :

`validé localement`

---

## 6. Ordre chronologique

L’historique conserve séparément les deux actions :

1. report masqué ;
2. report restauré.

Le rétablissement du report ne supprime pas l’entrée indiquant qu’il avait été masqué précédemment.

Cela permet de suivre l’évolution complète du contenu.

---

## 7. Administrateur ayant effectué l’action

Le champ :

`actor_id`

est associé au profil de l’administrateur connecté.

Il permet d’identifier l’auteur de l’action de modération.

Première valeur validée :

`julien`

Rôle :

`admin`

---

## 8. Action principale prioritaire

L’action principale reste prioritaire.

Ordre de fonctionnement :

1. modifier le statut du report ;
2. vérifier que la modification a réussi ;
3. ajouter une entrée dans l’historique ;
4. afficher le résultat à l’administrateur.

Si le report est correctement modifié mais que l’historique ne peut pas être enregistré, le site doit afficher un avertissement distinct.

Exemple :

`Report masqué avec succès, mais l’historique n’a pas pu être enregistré.`

---

## 9. Messages validés

Après masquage réussi avec historique :

`Report masqué avec succès et action enregistrée dans l’historique.`

Après restauration réussie avec historique :

`Report restauré avec succès et action enregistrée dans l’historique.`

Ces messages permettent de distinguer :

- la réussite de l’action principale ;
- la réussite de l’écriture de l’historique.

---

## 10. Données non enregistrées

L’historique ne doit jamais contenir :

- mot de passe ;
- token ;
- clé Supabase secrète ;
- clé `service_role`;
- donnée Auth sensible ;
- texte confidentiel complet d’une note interne ;
- information personnelle inutile.

Le champ `metadata` doit contenir seulement des informations techniques ou fonctionnelles non sensibles.

---

## 11. Test membre

Avec un compte `member` :

- l’espace admin n’apparaît pas ;
- les actions de modération n’apparaissent pas ;
- le membre ne peut pas lire l’historique ;
- le membre ne peut pas créer d’entrée historique ;
- le membre ne peut pas modifier ou supprimer une entrée.

Statut :

`validé par la configuration RLS et les privilèges`

---

## 12. Test visiteur

Avec un visiteur non connecté :

- l’espace admin n’apparaît pas ;
- aucune entrée historique n’est visible ;
- aucun accès anonyme à la table n’est autorisé.

Statut :

`validé par les privilèges`

---

## 13. Ce que ce test valide

RailReporters peut maintenant :

- enregistrer le masquage d’un report ;
- enregistrer la restauration d’un report ;
- identifier l’administrateur ayant effectué l’action ;
- conserver l’ancien statut ;
- conserver le nouveau statut ;
- conserver la date de l’action ;
- garder les anciennes entrées intactes ;
- empêcher leur modification et leur suppression depuis le frontend.

---

## 14. Ce que ce test ne fait pas encore

Non encore intégré dans l’historique :

- masquer un commentaire ;
- restaurer un commentaire ;
- bannir un utilisateur ;
- débannir un utilisateur ;
- examiner un signalement ;
- rejeter un signalement ;
- marquer un signalement comme traité ;
- créer une note interne ;
- modifier une note interne ;
- afficher l’historique dans l’espace admin.

Le masquage d’un report directement depuis un signalement pourra être testé et documenté séparément.

---

## 15. Prochaine étape recommandée

Prochaine étape :

`Mettre en ligne l’historique du masquage et de la restauration des reports.`

Après validation en ligne, étendre progressivement l’historique aux :

- commentaires ;
- utilisateurs ;
- signalements ;
- notes internes.

---

## 16. Décision actuelle

Historique de modération des reports : validé localement.

Statut :

`HISTORIQUE REPORTS LOCAL OK`
