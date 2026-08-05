# RailReporters — Test historique de modération des commentaires V2

## Objectif

Ce document garde une trace du test local de l’historique des actions de modération concernant les commentaires RailReporters.

La V2 beta publique est actuellement en ligne sur :

`railreporters.com`

L’intégration a été testée localement avant toute mise en ligne.

---

## 1. But du test

Vérifier que RailReporters peut enregistrer une entrée historique après une action de modération réussie sur un commentaire.

Actions testées :

- masquer un commentaire ;
- restaurer un commentaire ;
- masquer un commentaire directement depuis un signalement.

La table utilisée est :

`moderation_action_history`

---

## 2. Table d’historique

Table Supabase utilisée :

`moderation_action_history`

Champs principaux :

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

Chaque action ajoute une nouvelle ligne.

Les anciennes entrées ne sont ni remplacées ni supprimées par les actions suivantes.

---

## 3. Test — Masquer un commentaire

Compte utilisé :

`julien`

Rôle :

`admin`

Action réalisée :

`Masquer ce commentaire`

Modification du commentaire :

`comments.status = hidden`

Entrée historique attendue :

- `action_type = comment_hidden`;
- `target_type = comment`;
- `target_id = identifiant du commentaire`;
- `previous_status = published`;
- `new_status = hidden`;
- `actor_id = identifiant du compte admin`;
- `created_at = date de l’action`.

Résultat :

- le commentaire a disparu de l’affichage public ;
- il est resté conservé dans Supabase ;
- une ligne a été ajoutée dans `moderation_action_history`;
- le bon identifiant de commentaire a été enregistré ;
- l’administrateur responsable a été identifié.

Statut :

`validé localement`

---

## 4. Test — Restaurer un commentaire

Action réalisée :

`Restaurer ce commentaire`

Modification du commentaire :

`comments.status = published`

Entrée historique attendue :

- `action_type = comment_restored`;
- `target_type = comment`;
- `target_id = même identifiant du commentaire`;
- `previous_status = hidden`;
- `new_status = published`;
- `actor_id = identifiant du compte admin`;
- `created_at = date de l’action`.

Résultat :

- le commentaire a réapparu sous le report concerné ;
- une nouvelle ligne a été ajoutée dans l’historique ;
- l’entrée précédente `comment_hidden` est restée intacte ;
- aucune donnée n’a été dupliquée.

Statut :

`validé localement`

---

## 5. Test — Masquer un commentaire depuis un signalement

Action réalisée depuis :

`Espace admin RailReporters → Signalements`

Bouton utilisé :

`Masquer le commentaire signalé`

Modification du commentaire :

`comments.status = hidden`

Modification du signalement :

`moderation_reports.status = action_taken`

Entrée historique attendue :

- `action_type = comment_hidden_from_moderation_report`;
- `target_type = comment`;
- `target_id = identifiant du commentaire`;
- `moderation_report_id = identifiant du signalement`;
- `previous_status = published`;
- `new_status = hidden`;
- `actor_id = identifiant du compte admin`.

Résultat :

- le commentaire signalé a été masqué ;
- le signalement a été marqué comme traité ;
- l’entrée historique est liée au bon signalement ;
- le bon identifiant de commentaire a été enregistré.

Statut :

`validé localement`

---

## 6. Ordre chronologique conservé

Un cycle de modération peut produire plusieurs entrées distinctes :

1. `comment_hidden`;
2. `comment_restored`;
3. éventuellement `comment_hidden_from_moderation_report`.

Une restauration ne supprime pas la trace d’un ancien masquage.

L’historique permet donc de reconstituer les différentes décisions prises sur un commentaire.

---

## 7. Administrateur ayant effectué l’action

Le champ :

`actor_id`

est associé au profil de l’administrateur connecté.

Compte admin utilisé :

`julien`

Rôle :

`admin`

Cette information permettra plus tard d’afficher :

`Action effectuée par julien`

---

## 8. Lien avec le signalement

Lorsqu’une action est effectuée depuis un signalement, le champ :

`moderation_report_id`

conserve l’identifiant du signalement concerné.

Cela permet de relier :

- le signalement reçu ;
- le commentaire concerné ;
- l’action de modération ;
- l’administrateur responsable ;
- la date de l’action.

---

## 9. Action principale prioritaire

L’ordre de fonctionnement reste :

1. modifier le statut du commentaire ;
2. vérifier que la modification a réussi ;
3. ajouter une entrée dans l’historique ;
4. informer l’administrateur.

Si le commentaire est correctement modifié mais que l’écriture historique échoue, RailReporters affiche un avertissement distinct.

Exemple :

`Commentaire masqué avec succès, mais l’historique n’a pas pu être enregistré.`

Le site ne présente donc pas le masquage comme ayant échoué si le commentaire a déjà été modifié.

---

## 10. Messages validés

Après masquage avec historique :

`Commentaire masqué avec succès et action enregistrée dans l’historique.`

Après restauration avec historique :

`Commentaire restauré avec succès et action enregistrée dans l’historique.`

Après masquage depuis un signalement :

`Commentaire signalé masqué et signalement marqué comme traité et action enregistrée dans l’historique.`

---

## 11. Sécurité de l’historique

RLS est activé sur :

`moderation_action_history`

Policies présentes :

- `Moderators and admins can create moderation action history`;
- `Moderators and admins can read moderation action history`.

Privilèges frontend vérifiés :

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

Les policies RLS limitent ensuite la lecture et la création aux administrateurs ou futurs modérateurs non bannis.

---

## 12. Historique non modifiable

Depuis le frontend, les anciennes entrées ne peuvent pas être :

- modifiées ;
- supprimées.

Aucune policy `UPDATE` ou `DELETE` n’existe pour le frontend.

L’historique fonctionne donc comme un journal ajouté progressivement.

---

## 13. Données non enregistrées

L’historique ne doit jamais contenir :

- mot de passe ;
- token ;
- clé Supabase secrète ;
- clé `service_role`;
- donnée Auth sensible ;
- texte intégral d’une note interne confidentielle ;
- information personnelle inutile.

Le champ `metadata` doit rester limité à des données fonctionnelles non sensibles.

---

## 14. Fonctions existantes conservées

L’ajout de l’historique des commentaires n’a pas interrompu :

- l’historique des reports ;
- les notes internes admin ;
- les signalements ;
- l’aperçu du contenu signalé ;
- `Voir le contenu`;
- `Retour aux signalements`;
- masquer et restaurer un report ;
- bannir et débannir un utilisateur ;
- publication, photos et commentaires normaux.

Statut :

`validé localement`

---

## 15. Test membre

Avec un compte `member` :

- l’espace admin n’apparaît pas ;
- les actions de modération ne sont pas visibles ;
- le membre ne peut pas lire l’historique ;
- le membre ne peut pas créer une entrée historique ;
- le membre ne peut pas modifier ou supprimer une entrée.

La protection réelle est assurée par les policies RLS et les privilèges de la table.

---

## 16. Test visiteur

Avec un visiteur non connecté :

- l’espace admin n’apparaît pas ;
- aucune entrée historique n’est visible ;
- aucun accès anonyme à la table n’est accordé.

---

## 17. Ce que ce test valide

RailReporters peut maintenant :

- enregistrer le masquage d’un commentaire ;
- enregistrer la restauration d’un commentaire ;
- enregistrer un masquage lié à un signalement ;
- identifier l’administrateur responsable ;
- conserver l’ancien statut ;
- conserver le nouveau statut ;
- conserver la date ;
- conserver le lien vers le signalement ;
- préserver toutes les anciennes entrées ;
- empêcher leur modification ou suppression depuis le frontend.

---

## 18. Ce que l’historique ne couvre pas encore entièrement

Non encore intégré :

- bannir un utilisateur ;
- débannir un utilisateur ;
- examiner un signalement ;
- rejeter un signalement ;
- marquer un signalement comme traité sans masquage ;
- créer une note interne ;
- modifier une note interne ;
- afficher l’historique dans l’espace admin.

---

## 19. Prochaine étape recommandée

Prochaine étape :

`Mettre en ligne l’historique du masquage et de la restauration des commentaires.`

Après validation en ligne, étendre l’historique aux actions sur :

- les utilisateurs ;
- les signalements ;
- les notes internes.

---

## 20. Décision actuelle

Historique de modération des commentaires : validé localement.

Statut :

`HISTORIQUE COMMENTAIRES LOCAL OK`
