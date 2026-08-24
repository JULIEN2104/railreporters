# RailReporters — Test historique des statuts de signalement V2

## Objectif

Ce document conserve une trace du test local de l’historique des changements de statut des signalements RailReporters.

La V2 beta publique est actuellement disponible sur :

`railreporters.com`

La version corrigée décrite dans ce document a été testée localement avant toute mise en ligne.

---

## 1. Fonctions concernées

Le test concerne les actions administratives suivantes :

* `Marquer comme examiné`;
* `Rejeter`;
* `Action effectuée`.

Ces actions modifient le champ :

`moderation_reports.status`

et ajoutent une nouvelle entrée dans :

`moderation_action_history`

---

## 2. Statuts utilisés

Les statuts disponibles pour un signalement sont :

* `pending`;
* `reviewed`;
* `rejected`;
* `action_taken`.

Libellés affichés dans RailReporters :

* `pending` → En attente ;
* `reviewed` → Examiné ;
* `rejected` → Rejeté ;
* `action_taken` → Action effectuée.

---

## 3. Actions historiques prévues

Lorsqu’un signalement est marqué comme examiné :

`action_type = moderation_report_reviewed`

Lorsqu’un signalement est rejeté :

`action_type = moderation_report_rejected`

Lorsqu’un signalement est marqué comme traité :

`action_type = moderation_report_action_taken`

Pour chaque entrée, RailReporters conserve notamment :

* `actor_id`;
* `target_type`;
* `target_id`;
* `moderation_report_id`;
* `previous_status`;
* `new_status`;
* `reason`;
* `metadata`;
* `created_at`.

---

## 4. Problème découvert pendant le premier test

Pendant le premier test, un signalement déjà en :

`action_taken`

a pu être remis en :

`reviewed`

L’historique a correctement enregistré la transition réellement effectuée :

`action_taken → reviewed`

avec :

`action_type = moderation_report_reviewed`

Le fonctionnement de l’historique était donc techniquement correct, mais cette transition était fonctionnellement illogique.

Le statut `action_taken` doit être considéré comme un statut final.

---

## 5. Conservation de l’action de test

L’entrée historique correspondant à :

`action_taken → reviewed`

n’a pas été supprimée.

Cette entrée représente une action réellement effectuée pendant la phase de test.

L’historique doit rester cumulatif et ne doit pas être réécrit pour masquer une ancienne action.

Une action corrective a ensuite été effectuée :

`reviewed → action_taken`

avec :

`action_type = moderation_report_action_taken`

Cela permet de conserver honnêtement les deux étapes du test.

---

## 6. Correctif appliqué

La version locale a été corrigée afin de contrôler les transitions autorisées.

Nouvelle matrice de transitions :

| Statut actuel  | Transitions autorisées                 |
| -------------- | -------------------------------------- |
| `pending`      | `reviewed`, `rejected`, `action_taken` |
| `reviewed`     | `rejected`, `action_taken`             |
| `rejected`     | aucune                                 |
| `action_taken` | aucune                                 |

Les statuts suivants sont donc désormais finaux :

* `rejected`;
* `action_taken`.

---

## 7. Double protection

Le correctif protège les transitions à deux niveaux.

### Interface

Les boutons non autorisés ne sont plus affichés.

Exemple pour un signalement en `action_taken` :

`Statut final : aucune autre transition de statut n’est autorisée.`

### Logique JavaScript

Même si une action était déclenchée manuellement depuis le navigateur, le gestionnaire vérifie le statut actuel avant d’envoyer la mise à jour à Supabase.

Une transition interdite est donc refusée avant la modification de la base.

---

## 8. Test — Statuts finaux existants

Les anciens signalements déjà en :

`action_taken`

ont été contrôlés dans l’espace admin.

Résultat :

* les boutons `Marquer comme examiné`, `Rejeter` et `Action effectuée` ne sont plus affichés ;
* le message de statut final apparaît ;
* `Voir le contenu` reste disponible ;
* la note interne admin reste disponible ;
* les actions liées au contenu restent séparées des transitions de statut.

Statut :

`validé localement`

---

## 9. Parcours testé — pending vers reviewed

Un nouveau signalement de test a été créé avec :

`status = pending`

L’action suivante a été utilisée :

`Marquer comme examiné`

Modification obtenue :

`pending → reviewed`

Entrée ajoutée à l’historique :

* `action_type = moderation_report_reviewed`;
* `target_type = moderation_report`;
* `target_id = identifiant du signalement`;
* `moderation_report_id = même identifiant`;
* `previous_status = pending`;
* `new_status = reviewed`;
* `actor_id = identifiant de l’administrateur`.

Résultat dans l’interface :

* le statut affiche `Examiné`;
* le bouton `Marquer comme examiné` disparaît ;
* les boutons `Rejeter` et `Action effectuée` restent disponibles.

Statut :

`validé localement`

---

## 10. Parcours testé — reviewed vers action_taken

Sur le même signalement, l’action suivante a été utilisée :

`Action effectuée`

Modification obtenue :

`reviewed → action_taken`

Entrée ajoutée à l’historique :

* `action_type = moderation_report_action_taken`;
* `target_type = moderation_report`;
* `target_id = identifiant du signalement`;
* `moderation_report_id = même identifiant`;
* `previous_status = reviewed`;
* `new_status = action_taken`;
* `actor_id = identifiant de l’administrateur`.

Résultat dans l’interface :

* le statut affiche `Action effectuée`;
* les boutons de transition disparaissent ;
* le message de statut final apparaît ;
* aucune nouvelle transition n’est proposée.

Statut :

`validé localement`

---

## 11. Parcours complet validé

Le parcours suivant est validé :

`pending → reviewed → action_taken`

Deux entrées historiques distinctes sont conservées :

1. `moderation_report_reviewed`;
2. `moderation_report_action_taken`.

La deuxième action ne remplace pas la première.

L’historique permet donc de reconstituer la progression complète du signalement.

---

## 12. Parcours testé — pending vers rejected

Un second signalement de test a été créé avec le détail :

`TEST TRANSITION REJETEE`

Statut initial :

`pending`

L’action suivante a été utilisée :

`Rejeter`

Modification obtenue :

`pending → rejected`

Entrée historique attendue et vérifiée :

* `action_type = moderation_report_rejected`;
* `target_type = moderation_report`;
* `target_id = identifiant du signalement`;
* `moderation_report_id = même identifiant`;
* `previous_status = pending`;
* `new_status = rejected`;
* `actor_id = identifiant de l’administrateur`.

Résultat dans l’interface :

* le statut affiche `Rejeté`;
* les boutons de transition disparaissent ;
* le message de statut final apparaît.

Statut :

`validé localement`

---

## 13. Vérification SQL du rejet

Une requête SQL de lecture a été exécutée afin de vérifier précisément l’entrée historique liée au rejet.

Résultat obtenu :

* `action_type = moderation_report_rejected`;
* `previous_status = pending`;
* `new_status = rejected`;
* `details = TEST TRANSITION REJETEE`;
* `current_signalement_status = rejected`.

Cette vérification confirme que :

1. le bon signalement a été modifié ;
2. le statut actuel est bien `rejected`;
3. l’historique contient la bonne action ;
4. l’ancien et le nouveau statut sont corrects ;
5. le lien avec `moderation_reports` est fonctionnel.

Statut :

`validé`

---

## 14. Parcours de rejet validé

Le parcours suivant est validé :

`pending → rejected`

Le statut `rejected` est final.

Le signalement ne peut plus revenir vers :

* `reviewed`;
* `pending`;
* `action_taken`.

---

## 15. Prévention des doublons

Avant toute modification, RailReporters vérifie le statut actuel du signalement.

Comportements attendus :

* un signalement déjà `reviewed` ne produit pas un deuxième `moderation_report_reviewed`;
* un signalement déjà `rejected` ne produit pas un deuxième `moderation_report_rejected`;
* un signalement déjà `action_taken` ne produit pas un deuxième `moderation_report_action_taken`.

Message prévu lorsque le statut demandé est déjà appliqué :

`Ce signalement possède déjà ce statut.`

---

## 16. Actions combinées avec le contenu signalé

Les actions suivantes restent distinctes :

* `report_hidden_from_moderation_report`;
* `comment_hidden_from_moderation_report`.

Lorsqu’un contenu est masqué directement depuis un signalement, RailReporters ne crée pas en plus une deuxième entrée générique :

`moderation_report_action_taken`

Cela évite de journaliser deux fois la même décision administrative.

---

## 17. Priorité de l’action principale

L’ordre de fonctionnement reste :

1. récupérer le statut actuel ;
2. vérifier que la transition est autorisée ;
3. modifier `moderation_reports.status`;
4. renseigner `reviewed_at`;
5. vérifier que la modification a réussi ;
6. ajouter une entrée dans `moderation_action_history`;
7. actualiser l’espace admin ;
8. afficher le résultat.

Si le changement de statut réussit mais que l’historique échoue, RailReporters affiche un avertissement distinct.

Exemple :

`Signalement rejeté, mais l’historique n’a pas pu être enregistré.`

Le site ne présente donc pas la modification comme ayant échoué si le signalement a déjà été mis à jour.

---

## 18. Messages validés

Après examen complet :

`Signalement marqué comme examiné et action enregistrée dans l’historique.`

Après rejet complet :

`Signalement rejeté et action enregistrée dans l’historique.`

Après traitement complet :

`Signalement marqué comme traité et action enregistrée dans l’historique.`

---

## 19. Dates enregistrées

Lors du changement de statut :

* `moderation_reports.reviewed_at` est actualisé ;
* `moderation_action_history.created_at` est créé pour la nouvelle entrée.

Les deux dates correspondent approximativement à la même action administrative.

---

## 20. Administrateur responsable

Le champ :

`actor_id`

correspond à l’administrateur connecté.

Compte utilisé lors des tests :

`julien`

Rôle :

`admin`

L’historique permettra plus tard d’afficher :

* `Signalement examiné par julien`;
* `Signalement rejeté par julien`;
* `Signalement traité par julien`.

---

## 21. Sécurité de l’historique

RLS est activé sur :

`moderation_action_history`

Policies présentes :

* `Moderators and admins can create moderation action history`;
* `Moderators and admins can read moderation action history`.

Privilèges vérifiés :

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

Les policies RLS limitent ensuite la lecture et l’insertion aux administrateurs ou futurs modérateurs non bannis.

---

## 22. Historique non modifiable

Depuis le frontend, les entrées historiques ne peuvent pas être :

* modifiées ;
* supprimées.

Aucune policy `UPDATE` ou `DELETE` n’a été créée.

L’historique fonctionne comme un journal cumulatif.

---

## 23. Fonctions existantes conservées

Le correctif et l’historique des statuts n’ont pas interrompu :

* signaler un report ;
* signaler un commentaire ;
* afficher les signalements ;
* afficher l’aperçu du contenu ;
* Voir le contenu ;
* Retour aux signalements ;
* masquer un contenu signalé ;
* notes internes privées ;
* historique des reports ;
* historique des commentaires ;
* historique des utilisateurs ;
* publication, photos et commentaires normaux.

Statut :

`validé localement`

---

## 24. Test membre et visiteur

Ces transitions sont réservées à l’espace admin.

Avec un compte `member` :

* l’espace admin ne doit pas apparaître ;
* aucune action de traitement ne doit être accessible ;
* aucune entrée historique ne doit être lisible ou insérable.

Avec un visiteur non connecté :

* l’espace admin ne doit pas apparaître ;
* aucun signalement admin ne doit être visible ;
* aucun accès anonyme à l’historique ne doit être possible.

Ces protections devront être revérifiées avant la mise en ligne.

---

## 25. Ce que cette étape valide

RailReporters peut maintenant :

* enregistrer un signalement examiné ;
* enregistrer un signalement rejeté ;
* enregistrer un signalement marqué comme traité ;
* conserver le véritable statut précédent ;
* empêcher les retours depuis un statut final ;
* empêcher les doublons de statut ;
* identifier le signalement concerné ;
* identifier l’administrateur responsable ;
* conserver les différentes étapes dans l’ordre chronologique ;
* éviter les doublons lors d’un masquage direct du contenu signalé.

---

## 26. Décision actuelle

Historique des changements de statut des signalements : validé localement.

Parcours validés :

* `pending → reviewed → action_taken`;
* `pending → rejected`.

Statuts finaux verrouillés :

* `rejected`;
* `action_taken`.

Statut global :

`TRANSITIONS SIGNALEMENTS LOCAL OK`

Prochaine étape :

`Vérifier les fichiers locaux corrigés puis mettre la fonction en ligne.`
