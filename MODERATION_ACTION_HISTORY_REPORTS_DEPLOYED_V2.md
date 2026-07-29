# RailReporters — Historique de modération des reports déployé V2

## Objectif

Ce document confirme que le premier historique des actions de modération est maintenant déployé en ligne sur RailReporters.

Domaine concerné :

`railreporters.com`

---

## 1. Statut général

L’historique des actions de modération sur les reports est en ligne.

Actions principales validées :

- masquer un report ;
- restaurer un report.

Statut :

`validé en ligne`

---

## 2. Table utilisée

L’historique est enregistré dans la table privée :

`moderation_action_history`

Cette table conserve progressivement chaque action de modération.

Une nouvelle action ajoute une nouvelle ligne.

Les anciennes entrées ne sont ni remplacées ni supprimées par les actions suivantes.

---

## 3. Structure principale

Les informations enregistrées comprennent notamment :

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

---

## 4. Masquage d’un report

Action effectuée depuis le site :

`Masquer ce report`

Modification du report :

`reports.status = hidden`

Entrée ajoutée dans l’historique :

- `action_type = report_hidden`;
- `target_type = report`;
- `target_id = identifiant du report`;
- `previous_status = published`;
- `new_status = hidden`;
- `actor_id = identifiant de l’administrateur`;
- `created_at = date de l’action`.

Résultat validé :

- le report disparaît de l’affichage public ;
- le report reste dans Supabase ;
- une ligne d’historique est créée ;
- l’administrateur responsable est identifié.

Statut :

`validé en ligne`

---

## 5. Restauration d’un report

Action effectuée depuis l’espace admin :

`Restaurer ce report`

Modification du report :

`reports.status = published`

Entrée ajoutée dans l’historique :

- `action_type = report_restored`;
- `target_type = report`;
- `target_id = identifiant du report`;
- `previous_status = hidden`;
- `new_status = published`;
- `actor_id = identifiant de l’administrateur`;
- `created_at = date de l’action`.

Résultat validé :

- le report réapparaît dans `Derniers reports`;
- une nouvelle ligne d’historique est créée ;
- l’ancienne entrée `report_hidden` reste conservée ;
- les données du report ne sont pas dupliquées.

Statut :

`validé en ligne`

---

## 6. Ordre chronologique conservé

Un cycle de modération produit deux entrées distinctes :

1. `report_hidden`;
2. `report_restored`.

La restauration ne supprime pas la trace du masquage précédent.

L’historique permet donc de reconstituer l’évolution du report.

---

## 7. Masquage depuis un signalement

Le code prévoit aussi l’action :

`report_hidden_from_moderation_report`

Cette action est utilisée lorsqu’un report est masqué directement depuis un signalement.

Informations prévues :

- `target_type = report`;
- `target_id = identifiant du report`;
- `moderation_report_id = identifiant du signalement`;
- `previous_status = published`;
- `new_status = hidden`.

Cette action permet de relier la modération du report au signalement qui l’a déclenchée.

---

## 8. Administrateur ayant effectué l’action

Le champ :

`actor_id`

correspond au profil de l’administrateur connecté.

Premier compte admin utilisé :

`julien`

Rôle :

`admin`

Cette information permettra plus tard d’afficher :

`Action effectuée par julien`

---

## 9. Priorité de l’action principale

L’ordre de fonctionnement est :

1. modifier le statut du report ;
2. vérifier que la modification a réussi ;
3. ajouter l’entrée dans l’historique ;
4. informer l’administrateur.

Si le report est correctement modifié mais que l’historique échoue, RailReporters affiche un avertissement distinct.

Exemple :

`Report masqué avec succès, mais l’historique n’a pas pu être enregistré.`

Le site ne présente donc pas l’action principale comme ayant échoué si le report a déjà été modifié.

---

## 10. Messages validés

Après un masquage complet :

`Report masqué avec succès et action enregistrée dans l’historique.`

Après une restauration complète :

`Report restauré avec succès et action enregistrée dans l’historique.`

Ces messages confirment séparément :

- la modification du report ;
- l’écriture dans l’historique.

---

## 11. RLS

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

## 12. Privilèges vérifiés

Résultat des privilèges :

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

Les droits `SELECT` et `INSERT` sont ensuite limités par les policies RLS aux rôles admin ou moderator autorisés.

---

## 13. Historique non modifiable

Depuis le frontend, aucune entrée historique ne peut être :

- modifiée ;
- supprimée.

Aucune policy `UPDATE` ou `DELETE` n’a été créée.

L’historique fonctionne donc comme un journal ajouté progressivement.

---

## 14. Informations interdites

L’historique ne doit jamais contenir :

- mot de passe ;
- token ;
- clé Supabase secrète ;
- clé `service_role`;
- donnée Auth sensible ;
- texte intégral d’une note interne confidentielle ;
- information personnelle inutile.

Le champ `metadata` doit rester limité à des informations fonctionnelles non sensibles.

---

## 15. Fonctions conservées

La mise en place de l’historique n’a pas interrompu les fonctions suivantes :

- publication de reports ;
- commentaires ;
- photos Supabase Storage ;
- notes internes admin ;
- signalements ;
- aperçu du contenu signalé ;
- Voir le contenu ;
- Retour aux signalements ;
- masquer et restaurer un commentaire ;
- bannir et débannir un utilisateur.

Statut :

`validé en ligne`

---

## 16. Ce que cette étape valide

RailReporters peut maintenant :

- enregistrer le masquage d’un report ;
- enregistrer la restauration d’un report ;
- identifier l’administrateur responsable ;
- conserver l’ancien statut ;
- conserver le nouveau statut ;
- conserver la date de l’action ;
- relier une action à un signalement ;
- préserver toutes les anciennes entrées ;
- empêcher leur modification ou suppression depuis le frontend.

---

## 17. Ce qui reste à intégrer

L’historique ne couvre pas encore entièrement :

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

---

## 18. Prochaine étape recommandée

Étendre progressivement l’historique aux commentaires :

- `comment_hidden`;
- `comment_restored`;
- `comment_hidden_from_moderation_report`.

Après validation des commentaires, étendre l’historique aux :

- utilisateurs ;
- signalements ;
- notes internes.

---

## 19. Décision actuelle

Historique des actions sur les reports déployé et validé.

Statut :

`Moderation action history reports deployed — OK`
