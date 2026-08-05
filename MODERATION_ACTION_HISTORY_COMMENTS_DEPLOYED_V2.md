# RailReporters — Historique de modération des commentaires déployé V2

## Objectif

Ce document confirme que l’historique des actions de modération concernant les commentaires est maintenant déployé en ligne sur RailReporters.

Domaine concerné :

`railreporters.com`

---

## 1. Statut général

L’historique des actions de modération sur les commentaires est en ligne.

Actions validées :

- masquer un commentaire ;
- restaurer un commentaire ;
- masquer un commentaire depuis un signalement.

Statut :

`validé en ligne`

---

## 2. Table utilisée

Les actions sont enregistrées dans :

`moderation_action_history`

Chaque action ajoute une nouvelle ligne indépendante.

Les anciennes entrées restent conservées et ne sont pas remplacées par les actions suivantes.

---

## 3. Masquer un commentaire

Action effectuée depuis un report ouvert :

`Masquer ce commentaire`

Modification du commentaire :

`comments.status = hidden`

Entrée ajoutée dans l’historique :

- `action_type = comment_hidden`;
- `target_type = comment`;
- `target_id = identifiant du commentaire`;
- `previous_status = published`;
- `new_status = hidden`;
- `actor_id = identifiant de l’administrateur`;
- `created_at = date de l’action`.

Résultat validé :

- le commentaire disparaît de l’affichage public ;
- le commentaire reste conservé dans Supabase ;
- une entrée d’historique est créée ;
- le bon commentaire est identifié ;
- l’administrateur responsable est enregistré.

Statut :

`validé en ligne`

---

## 4. Restaurer un commentaire

Action effectuée depuis :

`Espace admin RailReporters → Commentaires masqués`

Bouton utilisé :

`Restaurer ce commentaire`

Modification du commentaire :

`comments.status = published`

Entrée ajoutée dans l’historique :

- `action_type = comment_restored`;
- `target_type = comment`;
- `target_id = même identifiant du commentaire`;
- `previous_status = hidden`;
- `new_status = published`;
- `actor_id = identifiant de l’administrateur`;
- `created_at = date de l’action`.

Résultat validé :

- le commentaire réapparaît sous le report concerné ;
- une nouvelle ligne historique est créée ;
- l’ancienne entrée `comment_hidden` reste conservée ;
- aucune donnée du commentaire n’est dupliquée.

Statut :

`validé en ligne`

---

## 5. Masquer un commentaire depuis un signalement

Action effectuée depuis :

`Espace admin RailReporters → Signalements`

Bouton utilisé :

`Masquer le commentaire signalé`

Modifications réalisées :

`comments.status = hidden`

`moderation_reports.status = action_taken`

Entrée ajoutée dans l’historique :

- `action_type = comment_hidden_from_moderation_report`;
- `target_type = comment`;
- `target_id = identifiant du commentaire`;
- `moderation_report_id = identifiant du signalement`;
- `previous_status = published`;
- `new_status = hidden`;
- `actor_id = identifiant de l’administrateur`.

Résultat validé :

- le commentaire signalé est masqué ;
- le signalement est marqué comme traité ;
- l’historique est lié au bon signalement ;
- le bon commentaire est identifié.

Statut :

`validé en ligne`

---

## 6. Ordre chronologique conservé

Un commentaire peut avoir plusieurs entrées successives :

1. `comment_hidden`;
2. `comment_restored`;
3. éventuellement `comment_hidden_from_moderation_report`.

Une restauration ne supprime pas la trace du masquage précédent.

L’historique permet donc de reconstituer les différentes décisions prises sur le commentaire.

---

## 7. Lien avec le signalement

Lorsqu’un commentaire est masqué depuis un signalement, le champ :

`moderation_report_id`

conserve l’identifiant du signalement concerné.

Cela permet de relier :

- le signalement ;
- le commentaire concerné ;
- l’action effectuée ;
- l’administrateur responsable ;
- la date de l’action.

---

## 8. Administrateur responsable

Le champ :

`actor_id`

correspond au profil de l’administrateur connecté.

Compte utilisé lors du test :

`julien`

Rôle :

`admin`

Cette information permettra plus tard d’afficher :

`Action effectuée par julien`

---

## 9. Priorité de l’action principale

L’ordre de fonctionnement est :

1. modifier le statut du commentaire ;
2. vérifier que la modification a réussi ;
3. ajouter une entrée dans l’historique ;
4. informer l’administrateur.

Si le commentaire est correctement modifié mais que l’historique ne peut pas être écrit, RailReporters affiche un avertissement distinct.

Exemple :

`Commentaire masqué avec succès, mais l’historique n’a pas pu être enregistré.`

---

## 10. Messages validés

Après masquage avec historique :

`Commentaire masqué avec succès et action enregistrée dans l’historique.`

Après restauration avec historique :

`Commentaire restauré avec succès et action enregistrée dans l’historique.`

Après masquage depuis un signalement :

`Commentaire signalé masqué et signalement marqué comme traité et action enregistrée dans l’historique.`

---

## 11. Historique des reports conservé

Les actions déjà déployées pour les reports restent fonctionnelles :

- `report_hidden`;
- `report_restored`;
- `report_hidden_from_moderation_report`.

L’ajout de l’historique des commentaires n’a pas supprimé ni remplacé les anciennes entrées des reports.

---

## 12. RLS

RLS est activé sur :

`moderation_action_history`

Policies présentes :

- `Moderators and admins can create moderation action history`;
- `Moderators and admins can read moderation action history`.

Les policies vérifient notamment :

- le rôle admin ou moderator ;
- l’identité de l’acteur ;
- l’absence de bannissement.

---

## 13. Privilèges frontend

Privilèges vérifiés :

### Rôle anon

- SELECT : non ;
- INSERT : non ;
- UPDATE : non ;
- DELETE : non.

### Rôle authenticated

- SELECT : oui ;
- INSERT : oui ;
- UPDATE : non ;
- DELETE : non.

Les opérations SELECT et INSERT restent ensuite limitées par RLS aux administrateurs ou futurs modérateurs autorisés.

---

## 14. Historique non modifiable

Depuis le frontend, aucune entrée historique ne peut être :

- modifiée ;
- supprimée.

Aucune policy `UPDATE` ou `DELETE` n’est disponible pour le frontend.

L’historique reste donc un journal ajouté progressivement.

---

## 15. Informations interdites

L’historique ne doit jamais contenir :

- mot de passe ;
- token ;
- clé Supabase secrète ;
- clé `service_role`;
- donnée Auth sensible ;
- texte intégral d’une note interne privée ;
- information personnelle inutile.

Le champ `metadata` doit contenir seulement des informations fonctionnelles non sensibles.

---

## 16. Fonctions conservées

L’ajout de l’historique des commentaires n’a pas interrompu :

- publication des reports ;
- ajout de commentaires ;
- upload des photos ;
- historique des reports ;
- signalements ;
- aperçu du contenu signalé ;
- Voir le contenu ;
- Retour aux signalements ;
- notes internes privées ;
- masquer et restaurer un report ;
- bannir et débannir un utilisateur.

Statut :

`validé en ligne`

---

## 17. Ce que cette étape valide

RailReporters peut maintenant :

- enregistrer le masquage d’un commentaire ;
- enregistrer la restauration d’un commentaire ;
- enregistrer un masquage lié à un signalement ;
- identifier l’administrateur responsable ;
- conserver l’ancien statut ;
- conserver le nouveau statut ;
- conserver la date ;
- conserver le lien vers le signalement ;
- préserver les anciennes entrées ;
- empêcher leur modification ou suppression depuis le frontend.

---

## 18. Ce qui reste à intégrer dans l’historique

Non encore entièrement intégré :

- bannir un utilisateur ;
- débannir un utilisateur ;
- examiner un signalement ;
- rejeter un signalement ;
- marquer un signalement comme traité sans masquer de contenu ;
- créer une note interne ;
- modifier une note interne ;
- afficher l’historique dans l’espace admin.

---

## 19. Prochaine étape recommandée

Étendre l’historique aux utilisateurs :

- `user_banned`;
- `user_unbanned`.

Puis étendre progressivement l’historique aux :

- statuts des signalements ;
- notes internes ;
- autres actions administratives.

---

## 20. Décision actuelle

Historique des actions sur les commentaires déployé et validé.

Statut :

`Moderation action history comments deployed — OK`
