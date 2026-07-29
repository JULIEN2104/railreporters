# RailReporters — Plan historique des actions de modération V2

## Objectif

Ce document prépare un historique privé des actions de modération réalisées dans RailReporters.

La V2 beta est actuellement en ligne sur :

`railreporters.com`

Le module admin permet déjà de :

- masquer un report ;
- restaurer un report ;
- masquer un commentaire ;
- restaurer un commentaire ;
- bannir un utilisateur ;
- débannir un utilisateur ;
- examiner un signalement ;
- rejeter un signalement ;
- marquer un signalement comme action effectuée ;
- masquer directement un contenu signalé ;
- enregistrer une note interne privée.

L’objectif est maintenant de conserver une trace structurée de ces actions.

---

## 1. Pourquoi créer un historique

Un historique permet de savoir :

- quelle action a été effectuée ;
- quel administrateur a effectué l’action ;
- quel contenu ou utilisateur était concerné ;
- à quelle date l’action a été effectuée ;
- quel était l’ancien statut ;
- quel est le nouveau statut ;
- si l’action était liée à un signalement ;
- quelle raison a été indiquée.

Cet historique sera utile pour :

- comprendre une ancienne décision ;
- corriger une erreur ;
- suivre les actions administratives ;
- préparer plusieurs administrateurs ou modérateurs ;
- éviter les décisions contradictoires ;
- répondre à une contestation.

---

## 2. Différence avec les journaux techniques

Les journaux techniques Supabase ne remplacent pas l’historique métier RailReporters.

L’historique RailReporters doit utiliser des actions compréhensibles comme :

`report_hidden`

`report_restored`

`comment_hidden`

`comment_restored`

`user_banned`

`user_unbanned`

`moderation_report_reviewed`

`moderation_report_rejected`

`moderation_report_action_taken`

`admin_note_created`

`admin_note_updated`

---

## 3. Table recommandée

Créer une table privée :

`moderation_action_history`

Cette table sera utilisée uniquement pour conserver l’historique des actions administratives.

---

## 4. Structure recommandée

Première structure proposée :

- `id` : uuid ;
- `actor_id` : uuid ;
- `action_type` : text ;
- `target_type` : text ;
- `target_id` : uuid facultatif ;
- `moderation_report_id` : uuid facultatif ;
- `previous_status` : text facultatif ;
- `new_status` : text facultatif ;
- `reason` : text facultatif ;
- `metadata` : jsonb ;
- `created_at` : timestamp avec fuseau horaire.

---

## 5. Administrateur ayant effectué l’action

Le champ :

`actor_id`

doit correspondre à l’identifiant du profil ayant effectué l’action.

Relation prévue :

`profiles.id → moderation_action_history.actor_id`

L’espace admin pourra ensuite afficher :

`Action effectuée par julien`

ou plus tard :

`Action effectuée par nom_du_moderateur`

---

## 6. Types de cibles

Le champ :

`target_type`

pourra contenir :

- `report`;
- `comment`;
- `profile`;
- `moderation_report`;
- `admin_note`.

Le champ :

`target_id`

contiendra l’identifiant du contenu ou de l’utilisateur concerné.

---

## 7. Actions sur les reports

Lorsqu’un report est masqué :

`action_type = report_hidden`

`target_type = report`

`previous_status = published`

`new_status = hidden`

Lorsqu’un report est restauré :

`action_type = report_restored`

`previous_status = hidden`

`new_status = published`

---

## 8. Actions sur les commentaires

Lorsqu’un commentaire est masqué :

`action_type = comment_hidden`

`target_type = comment`

`previous_status = published`

`new_status = hidden`

Lorsqu’un commentaire est restauré :

`action_type = comment_restored`

`previous_status = hidden`

`new_status = published`

---

## 9. Bannissement et débannissement

Lorsqu’un utilisateur est banni :

`action_type = user_banned`

`target_type = profile`

`previous_status = active`

`new_status = banned`

Lorsqu’un utilisateur est débanni :

`action_type = user_unbanned`

`previous_status = banned`

`new_status = active`

Le champ `reason` pourra contenir une raison courte.

Exemple :

`Spam répété dans les commentaires.`

---

## 10. Actions sur les signalements

Pour un signalement examiné :

`action_type = moderation_report_reviewed`

Pour un signalement rejeté :

`action_type = moderation_report_rejected`

Pour un signalement marqué comme traité :

`action_type = moderation_report_action_taken`

Le champ :

`moderation_report_id`

permettra de relier l’historique au signalement concerné.

---

## 11. Actions directes depuis un signalement

Lorsqu’un report est masqué depuis un signalement, éviter de créer deux entrées contradictoires.

Première version recommandée :

`action_type = report_hidden_from_moderation_report`

avec :

- `target_type = report`;
- `target_id = id du report`;
- `moderation_report_id = id du signalement`;
- `previous_status = published`;
- `new_status = hidden`.

Même principe pour un commentaire :

`comment_hidden_from_moderation_report`

---

## 12. Notes internes admin

Lorsqu’une note interne est créée :

`action_type = admin_note_created`

Lorsqu’elle est modifiée :

`action_type = admin_note_updated`

L’historique ne doit pas recopier le texte confidentiel complet de la note.

Il peut conserver uniquement :

- l’identifiant de la note ;
- l’identifiant du signalement ;
- l’administrateur ;
- la date ;
- le type d’action.

Cela évite de dupliquer une information confidentielle dans plusieurs tables.

---

## 13. Champ metadata

Le champ :

`metadata`

pourra contenir des informations complémentaires non sensibles.

Exemple :

```json
{
  "source": "admin_dashboard",
  "content_type": "comment",
  "previous_status": "published",
  "new_status": "hidden"
}
