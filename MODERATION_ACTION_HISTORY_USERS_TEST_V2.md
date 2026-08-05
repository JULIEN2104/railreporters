# RailReporters — Test historique de modération des utilisateurs V2

## Objectif

Ce document garde une trace du test local de l’historique des actions de modération concernant les utilisateurs RailReporters.

La V2 beta publique est actuellement en ligne sur :

`railreporters.com`

L’intégration a été testée localement avant toute mise en ligne.

---

## 1. But du test

Vérifier que RailReporters peut enregistrer une entrée historique après une action administrative réussie sur un compte membre.

Actions testées :

- bannir un membre ;
- débannir un membre.

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

## 3. Test — Bannir un membre

Compte administrateur utilisé :

`julien`

Rôle :

`admin`

Compte concerné :

`member`

Action réalisée :

`Bannir`

Modification du profil :

`profiles.is_banned = true`

Entrée historique attendue :

- `action_type = user_banned`;
- `target_type = profile`;
- `target_id = identifiant du profil membre`;
- `previous_status = active`;
- `new_status = banned`;
- `actor_id = identifiant du compte admin`;
- `created_at = date de l’action`.

Résultat :

- le compte membre est passé au statut banni ;
- une ligne a été ajoutée dans `moderation_action_history`;
- le bon profil membre a été enregistré dans `target_id`;
- l’administrateur responsable a été enregistré dans `actor_id`;
- le statut précédent et le nouveau statut ont été conservés.

Statut :

`validé localement`

---

## 4. Conséquences du bannissement

Après le bannissement, les protections déjà mises en place continuent de fonctionner.

Le membre banni ne peut plus :

- publier un report ;
- commenter ;
- uploader une photo ;
- envoyer un signalement.

Les anciens reports et commentaires du membre ne sont pas automatiquement supprimés.

Ils restent soumis aux actions de modération séparées.

Statut :

`validé localement`

---

## 5. Test — Débannir un membre

Action réalisée :

`Débannir`

Modification du profil :

`profiles.is_banned = false`

Entrée historique attendue :

- `action_type = user_unbanned`;
- `target_type = profile`;
- `target_id = même identifiant du profil membre`;
- `previous_status = banned`;
- `new_status = active`;
- `actor_id = identifiant du compte admin`;
- `created_at = date de l’action`.

Résultat :

- le compte membre est redevenu actif ;
- une nouvelle ligne a été ajoutée dans l’historique ;
- l’ancienne entrée `user_banned` est restée intacte ;
- la même cible utilisateur a été conservée ;
- aucune donnée du profil n’a été dupliquée.

Statut :

`validé localement`

---

## 6. Conséquences du débannissement

Après le débannissement, le membre peut à nouveau :

- se connecter ;
- publier un report ;
- commenter ;
- uploader une photo ;
- envoyer un signalement.

Le débannissement ne supprime pas l’entrée historique du bannissement précédent.

Statut :

`validé localement`

---

## 7. Ordre chronologique conservé

Un cycle complet de modération produit deux entrées distinctes :

1. `user_banned`;
2. `user_unbanned`.

Le débannissement ne supprime pas la trace du bannissement.

L’historique permet donc de reconstituer l’évolution du statut du compte.

---

## 8. Administrateur ayant effectué l’action

Le champ :

`actor_id`

est associé au profil de l’administrateur connecté.

Compte admin utilisé :

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

Cela permet de distinguer une action utilisateur des actions sur :

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

Ces valeurs rendent l’historique compréhensible sans devoir interpréter directement la valeur booléenne `is_banned`.

---

## 11. Métadonnées

Le champ `metadata` peut contenir des informations fonctionnelles non sensibles comme :

- `source = admin_dashboard`;
- `username = pseudo du membre`;
- `target_role = member`.

Le champ ne doit jamais contenir :

- mot de passe ;
- token ;
- clé Supabase ;
- donnée Auth sensible ;
- email privé inutile ;
- information personnelle non nécessaire.

---

## 12. Protection du compte admin principal

Le compte admin principal reste protégé.

Compte :

`julien`

Protections validées :

- aucun bouton de bannissement rapide sur son propre compte ;
- refus de bannir le compte actuellement connecté ;
- refus de bannir un compte `admin`;
- refus de bannir un compte `moderator`;
- première version limitée aux profils `member`.

Statut :

`validé localement`

---

## 13. Prévention des actions inutiles

La version locale évite les opérations inutiles :

- un compte déjà banni ne génère pas un deuxième `user_banned`;
- un compte déjà actif ne génère pas un `user_unbanned`;
- le site vérifie l’état du profil avant l’action.

Cela réduit les doublons involontaires dans l’historique.

---

## 14. Action principale prioritaire

L’ordre de fonctionnement est :

1. modifier `profiles.is_banned`;
2. vérifier que la modification a réussi ;
3. ajouter une entrée dans `moderation_action_history`;
4. actualiser la liste des utilisateurs ;
5. informer l’administrateur.

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

Ces messages confirment séparément :

- la modification du profil ;
- l’écriture dans l’historique.

---

## 16. Sécurité de l’historique

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

## 17. Historique non modifiable

Depuis le frontend, les anciennes entrées ne peuvent pas être :

- modifiées ;
- supprimées.

Aucune policy `UPDATE` ou `DELETE` n’est disponible pour le frontend.

L’historique fonctionne donc comme un journal ajouté progressivement.

---

## 18. Test compte membre

Avec un compte `member` :

- l’espace admin n’apparaît pas ;
- la liste administrative des utilisateurs n’apparaît pas ;
- le membre ne peut pas bannir ;
- le membre ne peut pas débannir ;
- le membre ne peut pas créer une entrée historique ;
- le membre ne peut pas lire l’historique.

La protection réelle est assurée par les privileges PostgreSQL et par RLS.

---

## 19. Test visiteur

Avec un visiteur non connecté :

- l’espace admin n’apparaît pas ;
- aucune gestion utilisateur n’est visible ;
- aucune entrée historique n’est accessible ;
- aucun privilège anonyme n’est accordé à la table.

---

## 20. Compatibilité avec les fonctions existantes

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

`validé localement`

---

## 21. Ce que ce test valide

RailReporters peut maintenant :

- enregistrer le bannissement d’un utilisateur ;
- enregistrer le débannissement d’un utilisateur ;
- identifier l’administrateur responsable ;
- identifier le membre concerné ;
- conserver l’ancien statut ;
- conserver le nouveau statut ;
- conserver la date ;
- préserver les anciennes entrées ;
- empêcher leur modification ou suppression depuis le frontend ;
- protéger le compte admin principal.

---

## 22. Ce que l’historique ne couvre pas encore entièrement

Non encore intégré :

- examen d’un signalement ;
- rejet d’un signalement ;
- signalement marqué comme traité sans masquage de contenu ;
- création d’une note interne ;
- modification d’une note interne ;
- affichage de l’historique dans l’espace admin ;
- raison détaillée obligatoire du bannissement ;
- bannissement temporaire.

---

## 23. Amélioration future avec user_bans

La table :

`user_bans`

pourra plus tard conserver :

- raison détaillée ;
- date de début ;
- date de fin ;
- caractère temporaire ou permanent ;
- administrateur responsable.

La première version actuelle utilise :

`profiles.is_banned = true / false`

et conserve la trace de chaque changement dans :

`moderation_action_history`

---

## 24. Prochaine étape recommandée

Prochaine étape :

`Mettre en ligne l’historique du bannissement et du débannissement des utilisateurs.`

Après validation en ligne, étendre l’historique aux :

- statuts des signalements ;
- notes internes ;
- autres actions administratives.

---

## 25. Décision actuelle

Historique de modération des utilisateurs : validé localement.

Statut :

`HISTORIQUE UTILISATEURS LOCAL OK`
