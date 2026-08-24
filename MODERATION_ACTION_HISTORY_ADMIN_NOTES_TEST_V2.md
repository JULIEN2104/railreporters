# RailReporters — Test historique des notes internes admin V2

## Objectif

Ce document garde une trace du test local de l’historique des actions concernant les notes internes administrateur de RailReporters.

La V2 beta publique est actuellement disponible sur :

`railreporters.com`

La nouvelle version a été testée localement avant toute mise en ligne.

---

## 1. Fonctions concernées

Le test concerne les actions suivantes :

* création d’une note interne admin ;
* modification d’une note interne existante ;
* détection d’un texte identique ;
* enregistrement de ces actions dans l’historique de modération.

Les notes sont enregistrées dans :

`moderation_report_admin_notes`

Les actions historiques sont enregistrées dans :

`moderation_action_history`

---

## 2. Types d’action utilisés

Lorsqu’une note interne est créée :

`action_type = admin_note_created`

Lorsqu’une note interne est réellement modifiée :

`action_type = admin_note_updated`

Ces deux valeurs étaient déjà autorisées par la contrainte de la table :

`moderation_action_history`

Aucune nouvelle migration SQL n’a été nécessaire pour cette intégration.

---

## 3. Confidentialité du texte de la note

Le texte complet de la note reste exclusivement dans :

`moderation_report_admin_notes.note`

Il n’est jamais recopié dans :

* `moderation_action_history.reason`;
* `moderation_action_history.metadata`;
* les statuts ;
* une autre table publique.

L’historique conserve uniquement des informations non sensibles sur l’opération réalisée.

---

## 4. Métadonnées enregistrées lors d’une création

Lorsqu’une note est créée, l’historique enregistre notamment :

* `source = admin_dashboard`;
* `operation = created`;
* `note_length = nombre de caractères`.

Le texte de la note n’est pas présent dans les métadonnées.

---

## 5. Métadonnées enregistrées lors d’une modification

Lorsqu’une note est modifiée, l’historique enregistre notamment :

* `source = admin_dashboard`;
* `operation = updated`;
* `previous_length = ancienne longueur`;
* `new_length = nouvelle longueur`.

Ces informations permettent de confirmer qu’une modification a eu lieu sans révéler le contenu confidentiel de la note.

---

## 6. Test — Création d’une note interne

Compte utilisé :

`julien`

Rôle :

`admin`

Action réalisée :

`Enregistrer la note`

Résultat dans la table des notes :

* une nouvelle ligne est créée dans `moderation_report_admin_notes`;
* la note est liée au bon signalement ;
* `created_by` correspond au compte admin ;
* `updated_by` correspond au compte admin ;
* `created_at` et `updated_at` sont enregistrés.

Entrée historique attendue :

* `action_type = admin_note_created`;
* `target_type = admin_note`;
* `target_id = identifiant de la note créée`;
* `moderation_report_id = identifiant du signalement`;
* `actor_id = identifiant de l’administrateur`;
* `previous_status = null`;
* `new_status = null`;
* `created_at = date de l’action`.

Message validé :

`Note interne enregistrée et action ajoutée à l’historique.`

Statut :

`validé localement`

---

## 7. Test après rechargement

Après la création de la note :

1. la page locale a été rechargée ;
2. l’administrateur s’est reconnecté si nécessaire ;
3. le même signalement a été retrouvé dans l’espace admin.

Résultat :

* la note est toujours présente ;
* le texte enregistré est correctement rechargé ;
* la note reste liée au bon signalement ;
* aucune seconde note n’est créée par le simple rechargement.

Statut :

`validé localement`

---

## 8. Test — Modification réelle d’une note

Une note existante a été modifiée en changeant réellement son texte.

Action utilisée :

`Mettre à jour la note`

Résultat dans la table des notes :

* la ligne existante est modifiée ;
* aucune deuxième ligne de note n’est créée ;
* `updated_by` correspond à l’administrateur ;
* `updated_at` est actualisé ;
* `created_at` reste inchangé.

Entrée historique attendue :

* `action_type = admin_note_updated`;
* `target_type = admin_note`;
* `target_id = même identifiant de note`;
* `moderation_report_id = même identifiant de signalement`;
* `actor_id = identifiant de l’administrateur`;
* `previous_status = null`;
* `new_status = null`.

Message validé :

`Note interne mise à jour et action ajoutée à l’historique.`

Statut :

`validé localement`

---

## 9. Conservation de l’historique précédent

La modification de la note ne supprime pas l’entrée :

`admin_note_created`

L’historique contient donc deux entrées différentes :

1. `admin_note_created`;
2. `admin_note_updated`.

Une nouvelle modification future pourra ajouter une autre ligne :

`admin_note_updated`

Les anciennes actions restent intactes.

---

## 10. Test — Texte identique

Une tentative de mise à jour a été réalisée sans modifier le moindre caractère de la note.

Résultat attendu et validé :

`Aucune modification n’a été détectée dans la note.`

Dans ce cas :

* aucun `UPDATE` n’est envoyé à la table des notes ;
* `updated_at` n’est pas modifié ;
* aucune nouvelle entrée `admin_note_updated` n’est créée ;
* la note existante reste inchangée.

Statut :

`validé localement`

---

## 11. Prévention des entrées historiques inutiles

RailReporters compare le texte actuel de la note avec le nouveau texte saisi.

Une entrée historique est créée uniquement lorsqu’une modification réelle est détectée.

Cette vérification évite :

* les doublons ;
* les mises à jour inutiles ;
* les fausses dates de modification ;
* les entrées `admin_note_updated` sans changement réel.

---

## 12. Limite de longueur

La note interne est limitée à :

`1000 caractères`

La limite est contrôlée :

* dans l’interface utilisateur ;
* par la contrainte PostgreSQL de la table.

Une note vide ne peut pas être enregistrée.

---

## 13. Administrateur responsable

Le champ :

`actor_id`

de l’historique correspond au profil admin ayant effectué l’action.

Compte utilisé lors des tests :

`julien`

Rôle :

`admin`

La table des notes conserve également :

* `created_by`;
* `updated_by`.

Cela permettra plus tard d’afficher :

* `Note créée par julien`;
* `Note mise à jour par julien`.

---

## 14. Signalement concerné

Le champ :

`moderation_report_id`

de l’historique contient l’identifiant du signalement auquel la note est associée.

La relation permet de relier :

* le signalement ;
* la note privée ;
* l’action historique ;
* l’administrateur responsable ;
* la date de l’action.

---

## 15. Indépendance du statut du signalement

Créer ou modifier une note ne modifie pas automatiquement :

* `moderation_reports.status`;
* `moderation_reports.reviewed_at`;
* le statut du report signalé ;
* le statut du commentaire signalé ;
* le statut de l’utilisateur concerné.

Les actions suivantes restent séparées :

* Marquer comme examiné ;
* Rejeter ;
* Action effectuée ;
* Masquer le contenu signalé.

Statut :

`validé localement`

---

## 16. Priorité de l’enregistrement de la note

L’ordre de fonctionnement est :

1. vérifier la présence d’un texte ;
2. vérifier la limite de longueur ;
3. créer ou modifier la note ;
4. récupérer la ligne enregistrée ;
5. vérifier la réussite de l’action principale ;
6. ajouter une entrée dans `moderation_action_history`;
7. actualiser la carte du signalement ;
8. informer l’administrateur.

La note reste l’action principale.

---

## 17. Échec éventuel de l’historique

Si la note est correctement enregistrée mais que l’écriture historique échoue, RailReporters affiche un avertissement distinct.

Après création :

`Note interne enregistrée, mais l’historique n’a pas pu être mis à jour.`

Après modification :

`Note interne mise à jour, mais l’historique n’a pas pu être enregistré.`

Le site ne présente donc pas l’enregistrement de la note comme ayant échoué si la table des notes a déjà été modifiée.

---

## 18. Sécurité de la table des notes

RLS est activé sur :

`moderation_report_admin_notes`

Policies présentes :

* `Moderators and admins can create moderation report admin notes`;
* `Moderators and admins can read moderation report admin notes`;
* `Moderators and admins can update moderation report admin notes`.

Les utilisateurs `member` et les visiteurs n’ont aucun accès à ces notes privées.

---

## 19. Sécurité de la table d’historique

RLS est activé sur :

`moderation_action_history`

Policies présentes :

* `Moderators and admins can create moderation action history`;
* `Moderators and admins can read moderation action history`.

Privilèges frontend vérifiés :

### Rôle anon

* SELECT : non ;
* INSERT : non ;
* UPDATE : non ;
* DELETE : non.

### Rôle authenticated

* SELECT : oui ;
* INSERT : oui ;
* UPDATE : non ;
* DELETE : non.

Les policies RLS réservent ensuite réellement la lecture et l’insertion aux administrateurs ou futurs modérateurs non bannis.

---

## 20. Historique non modifiable

Depuis le frontend, les entrées de `moderation_action_history` ne peuvent pas être :

* modifiées ;
* supprimées.

Chaque création ou modification réelle de note ajoute une nouvelle ligne.

L’historique fonctionne donc comme un journal cumulatif.

---

## 21. Test membre

Avec un compte `member` :

* l’espace admin n’apparaît pas ;
* les notes internes ne sont pas visibles ;
* les signalements admin ne sont pas visibles ;
* la table des notes ne retourne aucune donnée ;
* l’historique n’est pas lisible ;
* aucune entrée historique ne peut être créée.

Statut :

`validé par l’interface, les privilèges et RLS`

---

## 22. Test visiteur

Avec un visiteur non connecté :

* l’espace admin n’apparaît pas ;
* aucune note interne n’est visible ;
* aucune entrée historique n’est accessible ;
* aucun privilège anonyme n’est accordé aux deux tables.

Statut :

`validé par les privilèges`

---

## 23. Informations interdites

Une note interne et son historique ne doivent jamais contenir :

* mot de passe ;
* token ;
* clé Supabase secrète ;
* clé `service_role`;
* donnée Auth sensible ;
* information personnelle inutile.

Le texte complet de la note reste uniquement dans la table privée des notes.

---

## 24. Fonctions existantes conservées

L’ajout de cet historique n’a pas interrompu :

* historique des reports ;
* historique des commentaires ;
* historique des utilisateurs ;
* historique des statuts des signalements ;
* transitions finales corrigées ;
* signalements ;
* aperçu du contenu signalé ;
* Voir le contenu ;
* Retour aux signalements ;
* masquer et restaurer un report ;
* masquer et restaurer un commentaire ;
* bannir et débannir un membre ;
* publication des reports ;
* photos ;
* commentaires publics.

Statut :

`validé localement`

---

## 25. Ce que cette étape valide

RailReporters peut maintenant :

* enregistrer la création d’une note interne ;
* enregistrer une modification réelle ;
* détecter une absence de modification ;
* empêcher une entrée historique inutile ;
* identifier la note concernée ;
* identifier le signalement concerné ;
* identifier l’administrateur responsable ;
* conserver la date de chaque action ;
* conserver les anciennes actions ;
* ne pas recopier le contenu confidentiel dans l’historique ;
* empêcher la modification ou la suppression du journal depuis le frontend.

---

## 26. Historique maintenant couvert localement

Actions sur les reports :

* `report_hidden`;
* `report_restored`;
* `report_hidden_from_moderation_report`.

Actions sur les commentaires :

* `comment_hidden`;
* `comment_restored`;
* `comment_hidden_from_moderation_report`.

Actions sur les utilisateurs :

* `user_banned`;
* `user_unbanned`.

Actions sur les signalements :

* `moderation_report_reviewed`;
* `moderation_report_rejected`;
* `moderation_report_action_taken`.

Actions sur les notes internes :

* `admin_note_created`;
* `admin_note_updated`.

---

## 27. Ce qui reste à faire

Non encore fait :

* mise en ligne de l’historique des notes ;
* affichage de l’historique dans l’espace admin ;
* filtres par action ;
* filtres par administrateur ;
* recherche dans l’historique ;
* plusieurs notes distinctes par signalement ;
* restauration d’une ancienne version de note ;
* export du journal de modération.

---

## 28. Décision actuelle

Historique de création et de modification des notes internes : validé localement.

Statut global :

`HISTORIQUE NOTES ADMIN LOCAL OK`

Prochaine étape :

`Vérifier les fichiers locaux actuels puis mettre cette intégration en ligne.`
