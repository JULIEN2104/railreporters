# RailReporters — Historique de modération des utilisateurs déployé V2

## Objectif

Ce document confirme que l’historique des actions de modération concernant les utilisateurs est maintenant déployé en ligne sur RailReporters.

Domaine concerné :

`railreporters.com`

---

## 1. Statut général

L’historique des actions administratives sur les comptes membres est en ligne.

Actions validées :

- bannir un membre ;
- débannir un membre.

Statut :

`validé en ligne`

---

## 2. Table utilisée

Les actions sont enregistrées dans :

`moderation_action_history`

Chaque bannissement ou débannissement ajoute une nouvelle ligne indépendante.

Les anciennes entrées restent conservées.

Un débannissement ne supprime donc pas la trace du bannissement précédent.

---

## 3. Bannissement d’un membre

Action effectuée depuis :

`Espace admin RailReporters → Utilisateurs`

Bouton utilisé :

`Bannir`

Modification du profil :

`profiles.is_banned = true`

Entrée ajoutée dans l’historique :

- `action_type = user_banned`;
- `target_type = profile`;
- `target_id = identifiant du profil membre`;
- `previous_status = active`;
- `new_status = banned`;
- `actor_id = identifiant de l’administrateur`;
- `created_at = date de l’action`.

Résultat validé :

- le compte membre passe au statut banni ;
- la liste des utilisateurs est actualisée ;
- une entrée historique est créée ;
- le bon compte membre est identifié ;
- l’administrateur responsable est enregistré ;
- l’ancien et le nouveau statut sont conservés.

Statut :

`validé en ligne`

---

## 4. Conséquences du bannissement

Après le bannissement, le membre concerné ne peut plus :

- publier un report ;
- commenter ;
- uploader une photo ;
- envoyer un signalement.

Les contenus déjà publiés par le membre ne sont pas automatiquement supprimés ou masqués.

Ils peuvent être modérés séparément par l’administrateur.

Statut :

`validé en ligne`

---

## 5. Débannissement d’un membre

Action effectuée depuis :

`Espace admin RailReporters → Utilisateurs`

Bouton utilisé :

`Débannir`

Modification du profil :

`profiles.is_banned = false`

Entrée ajoutée dans l’historique :

- `action_type = user_unbanned`;
- `target_type = profile`;
- `target_id = même identifiant du profil membre`;
- `previous_status = banned`;
- `new_status = active`;
- `actor_id = identifiant de l’administrateur`;
- `created_at = date de l’action`.

Résultat validé :

- le compte membre redevient actif ;
- une nouvelle entrée historique est créée ;
- l’entrée précédente `user_banned` reste conservée ;
- aucune donnée du profil n’est dupliquée.

Statut :

`validé en ligne`

---

## 6. Conséquences du débannissement

Après le débannissement, le membre peut à nouveau :

- utiliser son compte ;
- publier un report ;
- commenter ;
- uploader une photo ;
- envoyer un signalement.

Le débannissement ne supprime pas l’historique du bannissement précédent.

Statut :

`validé en ligne`

---

## 7. Ordre chronologique conservé

Un cycle complet produit deux entrées différentes :

1. `user_banned`;
2. `user_unbanned`.

L’historique permet donc de reconstituer l’évolution du statut du compte.

Exemple :

`actif → banni → actif`

Chaque étape conserve :

- la cible ;
- l’administrateur ;
- la date ;
- l’ancien statut ;
- le nouveau statut.

---

## 8. Administrateur responsable

Le champ :

`actor_id`

correspond au profil de l’administrateur connecté.

Compte administrateur utilisé lors du test :

`julien`

Rôle :

`admin`

Cette information permettra plus tard d’afficher :

`Utilisateur banni par julien`

ou :

`Utilisateur débanni par julien`

---

## 9. Utilisateur concerné

Le champ :

`target_id`

contient l’identifiant du profil membre concerné.

Le champ :

`target_type`

contient :

`profile`

Cela distingue une action utilisateur des actions concernant :

- un report ;
- un commentaire ;
- un signalement ;
- une note interne.

---

## 10. Ancien et nouveau statut

Pour le bannissement :

- `previous_status = active`;
- `new_status = banned`.

Pour le débannissement :

- `previous_status = banned`;
- `new_status = active`.

Ces valeurs rendent l’historique lisible sans avoir à interpréter directement la valeur booléenne `profiles.is_banned`.

---

## 11. Métadonnées enregistrées

Le champ `metadata` peut contenir des informations fonctionnelles non sensibles comme :

- `source = admin_dashboard`;
- `username = pseudo du membre`;
- `target_role = member`.

Il ne doit jamais contenir :

- mot de passe ;
- token ;
- clé Supabase ;
- clé `service_role`;
- donnée Auth sensible ;
- information personnelle inutile.

---

## 12. Protection du compte admin principal

Le compte admin principal reste protégé.

Compte concerné :

`julien`

Protections déployées :

- aucun bouton de bannissement rapide sur le compte admin connecté ;
- refus de bannir son propre compte ;
- refus de bannir un profil ayant le rôle `admin`;
- refus de bannir un profil ayant le rôle `moderator`;
- première version limitée aux profils `member`.

Statut :

`validé en ligne`

---

## 13. Prévention des actions inutiles

RailReporters vérifie l’état actuel du profil avant l’action.

Comportement prévu :

- un compte déjà banni ne génère pas un nouveau `user_banned`;
- un compte déjà actif ne génère pas un `user_unbanned`;
- les actions inutiles sont refusées ;
- les doublons involontaires dans l’historique sont évités.

---

## 14. Priorité de l’action principale

L’ordre de fonctionnement est :

1. modifier `profiles.is_banned`;
2. vérifier que la modification a réussi ;
3. ajouter une entrée dans `moderation_action_history`;
4. actualiser la liste des utilisateurs ;
5. afficher le résultat à l’administrateur.

Si le profil est correctement modifié mais que l’historique ne peut pas être enregistré, RailReporters affiche un avertissement distinct.

Exemple :

`Utilisateur banni avec succès, mais l’historique n’a pas pu être enregistré.`

Le site ne présente donc pas le bannissement comme ayant échoué si le profil a déjà été modifié.

---

## 15. Messages validés

Après bannissement complet :

`Utilisateur banni avec succès et action enregistrée dans l’historique.`

Après débannissement complet :

`Utilisateur débanni avec succès et action enregistrée dans l’historique.`

Ces messages permettent de distinguer :

- la réussite de la modification du profil ;
- la réussite de l’enregistrement historique.

---

## 16. RLS

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

## 17. Privilèges frontend

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

Les opérations `SELECT` et `INSERT` sont ensuite limitées par RLS aux administrateurs ou futurs modérateurs autorisés.

---

## 18. Historique non modifiable

Depuis le frontend, aucune ancienne entrée ne peut être :

- modifiée ;
- supprimée.

Aucune policy `UPDATE` ou `DELETE` n’est disponible pour le frontend.

L’historique fonctionne donc comme un journal ajouté progressivement.

---

## 19. Fonctions existantes conservées

L’ajout de l’historique utilisateurs n’a pas interrompu :

- l’historique des reports ;
- l’historique des commentaires ;
- les notes internes admin ;
- les signalements ;
- l’aperçu du contenu signalé ;
- `Voir le contenu`;
- `Retour aux signalements`;
- masquer et restaurer un report ;
- masquer et restaurer un commentaire ;
- publication, photos et commentaires normaux.

Statut :

`validé en ligne`

---

## 20. Ce que cette étape valide

RailReporters peut maintenant :

- enregistrer le bannissement d’un membre ;
- enregistrer le débannissement d’un membre ;
- identifier l’administrateur responsable ;
- identifier le profil concerné ;
- conserver l’ancien statut ;
- conserver le nouveau statut ;
- conserver la date de l’action ;
- préserver les anciennes entrées ;
- protéger le compte administrateur principal ;
- empêcher la modification ou la suppression de l’historique depuis le frontend.

---

## 21. Historique actuellement disponible

Actions de reports :

- `report_hidden`;
- `report_restored`;
- `report_hidden_from_moderation_report`.

Actions de commentaires :

- `comment_hidden`;
- `comment_restored`;
- `comment_hidden_from_moderation_report`.

Actions d’utilisateurs :

- `user_banned`;
- `user_unbanned`.

---

## 22. Ce qui reste à intégrer

L’historique ne couvre pas encore entièrement :

- signalement marqué comme examiné ;
- signalement rejeté ;
- signalement marqué comme traité sans masquage ;
- création d’une note interne ;
- modification d’une note interne ;
- affichage de l’historique dans l’espace admin ;
- raison détaillée obligatoire du bannissement ;
- bannissement temporaire.

---

## 23. Prochaine étape recommandée

Étendre l’historique aux statuts des signalements :

- `moderation_report_reviewed`;
- `moderation_report_rejected`;
- `moderation_report_action_taken`.

Puis étendre l’historique aux notes internes :

- `admin_note_created`;
- `admin_note_updated`.

Enfin, afficher l’historique dans :

`Espace admin RailReporters`

---

## 24. Décision actuelle

Historique des actions sur les utilisateurs déployé et validé.

Statut :

`Moderation action history users deployed — OK`
