# RailReporters — Historique et transitions des signalements déployés V2

## Objectif

Ce document confirme que l’historique des changements de statut des signalements et le correctif des transitions sont maintenant déployés sur RailReporters.

Domaine concerné :

`railreporters.com`

---

## 1. Statut général

Les changements de statut des signalements sont maintenant enregistrés dans :

`moderation_action_history`

Actions déployées :

* `moderation_report_reviewed`;
* `moderation_report_rejected`;
* `moderation_report_action_taken`.

Le correctif de verrouillage des statuts finaux est également en ligne.

Statut :

`validé en ligne`

---

## 2. Statuts des signalements

Les signalements utilisent les statuts suivants :

* `pending` : en attente ;
* `reviewed` : examiné ;
* `rejected` : rejeté ;
* `action_taken` : action effectuée.

---

## 3. Transitions autorisées

Matrice actuellement déployée :

| Statut actuel  | Transitions autorisées                 |
| -------------- | -------------------------------------- |
| `pending`      | `reviewed`, `rejected`, `action_taken` |
| `reviewed`     | `rejected`, `action_taken`             |
| `rejected`     | aucune                                 |
| `action_taken` | aucune                                 |

Les statuts suivants sont définitifs :

* `rejected`;
* `action_taken`.

---

## 4. Signalement marqué comme examiné

Action dans l’espace admin :

`Marquer comme examiné`

Modification du signalement :

`moderation_reports.status = reviewed`

Entrée ajoutée dans l’historique :

* `action_type = moderation_report_reviewed`;
* `target_type = moderation_report`;
* `target_id = identifiant du signalement`;
* `moderation_report_id = même identifiant`;
* `previous_status = statut réel avant l’action`;
* `new_status = reviewed`;
* `actor_id = identifiant de l’administrateur`;
* `created_at = date de l’action`.

Parcours validé :

`pending → reviewed`

Statut :

`validé en ligne`

---

## 5. Signalement rejeté

Action dans l’espace admin :

`Rejeter`

Modification du signalement :

`moderation_reports.status = rejected`

Entrée ajoutée dans l’historique :

* `action_type = moderation_report_rejected`;
* `target_type = moderation_report`;
* `target_id = identifiant du signalement`;
* `moderation_report_id = même identifiant`;
* `previous_status = statut réel avant l’action`;
* `new_status = rejected`;
* `actor_id = identifiant de l’administrateur`.

Parcours validé :

`pending → rejected`

Une vérification SQL a confirmé :

* `action_type = moderation_report_rejected`;
* `previous_status = pending`;
* `new_status = rejected`;
* le signalement ciblé est bien celui du test ;
* son statut actuel est bien `rejected`.

Statut :

`validé en ligne`

---

## 6. Signalement marqué comme traité

Action dans l’espace admin :

`Action effectuée`

Modification du signalement :

`moderation_reports.status = action_taken`

Entrée ajoutée dans l’historique :

* `action_type = moderation_report_action_taken`;
* `target_type = moderation_report`;
* `target_id = identifiant du signalement`;
* `moderation_report_id = même identifiant`;
* `previous_status = statut réel avant l’action`;
* `new_status = action_taken`;
* `actor_id = identifiant de l’administrateur`.

Parcours validé :

`pending → reviewed → action_taken`

Deux entrées restent conservées :

1. `moderation_report_reviewed`;
2. `moderation_report_action_taken`.

Statut :

`validé en ligne`

---

## 7. Prévention des doublons

RailReporters vérifie le statut actuel avant chaque modification.

Comportements déployés :

* un signalement déjà `reviewed` ne peut pas produire un deuxième `moderation_report_reviewed`;
* un signalement déjà `rejected` ne peut pas produire un deuxième `moderation_report_rejected`;
* un signalement déjà `action_taken` ne peut pas produire un deuxième `moderation_report_action_taken`.

Message possible :

`Ce signalement possède déjà ce statut.`

---

## 8. Verrouillage des statuts finaux

Lorsqu’un signalement est en :

* `rejected`;
* `action_taken`;

les boutons suivants ne sont plus disponibles :

* `Marquer comme examiné`;
* `Rejeter`;
* `Action effectuée`.

L’interface affiche :

`Statut final : aucune autre transition de statut n’est autorisée.`

---

## 9. Correctif du signalement rejeté

Un second problème a été découvert pendant les tests.

Avant correction, un signalement `rejected` pouvait encore proposer :

`Masquer le contenu signalé`

Cette action aurait pu forcer indirectement :

`rejected → action_taken`

Le correctif déployé empêche désormais ce comportement.

Sur un signalement rejeté :

* le contenu ne peut plus être masqué depuis le signalement ;
* le bouton est désactivé ;
* le libellé indique `Signalement rejeté`;
* aucune transition vers `action_taken` n’est possible.

---

## 10. Double protection des transitions

La protection est appliquée à deux niveaux.

### Interface

Les boutons non autorisés ne sont pas affichés ou sont désactivés.

### JavaScript

Même si une action interdite était déclenchée manuellement, la fonction vérifie le statut actuel et refuse la transition avant toute mise à jour Supabase.

L’interface seule n’est donc pas l’unique protection fonctionnelle.

---

## 11. Actions combinées avec un masquage

Les actions suivantes restent distinctes :

* `report_hidden_from_moderation_report`;
* `comment_hidden_from_moderation_report`.

Lorsqu’un contenu est masqué depuis un signalement `pending` ou `reviewed` :

* le contenu passe en `hidden`;
* le signalement passe en `action_taken`;
* l’action précise de masquage est enregistrée dans l’historique.

RailReporters ne crée pas en plus une entrée générique `moderation_report_action_taken` pour la même opération.

Cela évite une double journalisation de la même décision.

---

## 12. Ancienne transition de test conservée

Pendant les premiers tests, la transition suivante avait été autorisée :

`action_taken → reviewed`

L’historique avait correctement enregistré cette action réelle.

Une action corrective avait ensuite remis le signalement en :

`reviewed → action_taken`

Ces anciennes entrées n’ont pas été supprimées.

Cette décision respecte le principe d’un historique cumulatif et non réécrit.

---

## 13. Dates enregistrées

Chaque changement de statut renseigne :

* `moderation_reports.reviewed_at`;
* `moderation_action_history.created_at`.

Ces dates permettent de connaître approximativement le moment du traitement et le moment de l’écriture de l’historique.

---

## 14. Administrateur responsable

Le champ :

`actor_id`

identifie l’administrateur ayant effectué l’action.

Compte utilisé lors des tests :

`julien`

Rôle :

`admin`

L’historique pourra ainsi afficher plus tard :

* `Signalement examiné par julien`;
* `Signalement rejeté par julien`;
* `Signalement traité par julien`.

---

## 15. Priorité de l’action principale

L’ordre de fonctionnement est :

1. récupérer le statut actuel ;
2. vérifier que la transition est autorisée ;
3. modifier le signalement ;
4. enregistrer `reviewed_at`;
5. vérifier la réussite de la modification ;
6. ajouter l’entrée historique ;
7. actualiser l’espace admin ;
8. afficher le résultat.

Si la modification du statut réussit mais que l’historique échoue, RailReporters affiche un avertissement spécifique.

Exemple :

`Signalement rejeté, mais l’historique n’a pas pu être enregistré.`

---

## 16. Messages validés

Après examen :

`Signalement marqué comme examiné et action enregistrée dans l’historique.`

Après rejet :

`Signalement rejeté et action enregistrée dans l’historique.`

Après traitement :

`Signalement marqué comme traité et action enregistrée dans l’historique.`

---

## 17. Historique non modifiable

La table utilisée est :

`moderation_action_history`

Les entrées historiques ne peuvent pas être modifiées ou supprimées depuis le frontend.

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

Les policies RLS réservent ensuite la lecture et la création aux administrateurs ou futurs modérateurs non bannis.

---

## 18. Fonctions conservées

La mise en ligne du correctif n’a pas interrompu :

* signaler un report ;
* signaler un commentaire ;
* aperçu du contenu signalé ;
* Voir le contenu ;
* Retour aux signalements ;
* masquer un report ;
* restaurer un report ;
* masquer un commentaire ;
* restaurer un commentaire ;
* historique des reports ;
* historique des commentaires ;
* historique des utilisateurs ;
* notes internes privées ;
* bannissement et débannissement ;
* publication des reports ;
* photos ;
* commentaires publics.

Statut :

`validé en ligne`

---

## 19. Test membre

Avec un compte `member` :

* l’espace admin n’apparaît pas ;
* aucune action de traitement n’est visible ;
* aucun historique interne n’est accessible ;
* aucune transition de signalement ne peut être déclenchée.

---

## 20. Test visiteur

Avec un visiteur non connecté :

* l’espace admin n’apparaît pas ;
* les signalements admin ne sont pas visibles ;
* l’historique n’est pas accessible ;
* aucun privilège anonyme n’est accordé.

---

## 21. Historique actuellement couvert

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

---

## 22. Ce qui reste à intégrer

L’historique ne couvre pas encore entièrement :

* `admin_note_created`;
* `admin_note_updated`;
* affichage de l’historique dans l’espace admin ;
* filtres par action ;
* filtres par administrateur ;
* recherche par contenu ;
* historique détaillé des raisons de bannissement.

---

## 23. Décision actuelle

Historique des changements de statut des signalements et correctif des transitions : déployés et validés.

Parcours validés :

* `pending → reviewed → action_taken`;
* `pending → rejected`.

Statuts finaux verrouillés :

* `rejected`;
* `action_taken`.

Statut global :

`Moderation action history moderation reports deployed — OK`
