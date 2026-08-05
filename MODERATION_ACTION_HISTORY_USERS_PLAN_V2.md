# RailReporters — Plan historique de modération des utilisateurs V2

## Objectif

Ce document prépare l’extension de l’historique de modération RailReporters aux actions effectuées sur les utilisateurs.

La V2 beta est actuellement en ligne sur :

`railreporters.com`

L’historique couvre déjà :

- masquer un report ;
- restaurer un report ;
- masquer un report depuis un signalement ;
- masquer un commentaire ;
- restaurer un commentaire ;
- masquer un commentaire depuis un signalement.

La prochaine étape est d’enregistrer :

- bannir un utilisateur ;
- débannir un utilisateur.

---

## 1. Table utilisée

Les actions seront enregistrées dans :

`moderation_action_history`

Chaque action ajoutera une nouvelle ligne indépendante.

Les anciennes entrées ne seront ni remplacées ni supprimées.

---

## 2. Bannissement d’un utilisateur

Action actuelle dans l’espace admin :

`Bannir`

Modification du profil :

`profiles.is_banned = true`

Entrée historique prévue :

- `action_type = user_banned`;
- `target_type = profile`;
- `target_id = identifiant du profil membre`;
- `previous_status = active`;
- `new_status = banned`;
- `actor_id = identifiant de l’administrateur`;
- `reason = raison facultative`;
- `created_at = date de l’action`.

---

## 3. Débannissement d’un utilisateur

Action actuelle dans l’espace admin :

`Débannir`

Modification du profil :

`profiles.is_banned = false`

Entrée historique prévue :

- `action_type = user_unbanned`;
- `target_type = profile`;
- `target_id = même identifiant du profil`;
- `previous_status = banned`;
- `new_status = active`;
- `actor_id = identifiant de l’administrateur`;
- `reason = raison facultative`;
- `created_at = date de l’action`.

---

## 4. Identifiant de l’utilisateur concerné

Le champ :

`target_id`

doit contenir l’identifiant du profil concerné.

Relation logique :

`profiles.id → moderation_action_history.target_id`

Le compte membre concerné doit être identifiable sans enregistrer de mot de passe, de token ou d’information Auth sensible.

---

## 5. Administrateur responsable

Le champ :

`actor_id`

doit contenir l’identifiant de l’administrateur connecté.

Compte admin actuel :

`julien`

Rôle :

`admin`

Cela permettra plus tard d’afficher :

`Utilisateur banni par julien`

ou :

`Utilisateur débanni par julien`

---

## 6. Ancien et nouveau statut

Pour un bannissement :

- `previous_status = active`;
- `new_status = banned`.

Pour un débannissement :

- `previous_status = banned`;
- `new_status = active`.

Le journal doit conserver les deux entrées séparément.

Un débannissement ne doit jamais supprimer la trace du bannissement précédent.

---

## 7. Ordre de fonctionnement

Ordre recommandé :

1. modifier `profiles.is_banned`;
2. vérifier que la modification a réussi ;
3. ajouter une entrée dans `moderation_action_history`;
4. recharger la liste des utilisateurs ;
5. afficher le résultat à l’administrateur.

L’action principale reste prioritaire.

---

## 8. Échec de l’historique

Si l’utilisateur est correctement banni, mais que l’historique ne peut pas être enregistré, afficher :

`Utilisateur banni avec succès, mais l’historique n’a pas pu être enregistré.`

Si l’utilisateur est correctement débanni, mais que l’historique échoue :

`Utilisateur débanni avec succès, mais l’historique n’a pas pu être enregistré.`

Le site ne doit pas prétendre que le bannissement a échoué si `profiles.is_banned` a déjà été modifié.

---

## 9. Messages après réussite complète

Après bannissement :

`Utilisateur banni avec succès et action enregistrée dans l’historique.`

Après débannissement :

`Utilisateur débanni avec succès et action enregistrée dans l’historique.`

---

## 10. Protection du compte admin principal

Le compte admin principal ne doit pas pouvoir être banni accidentellement depuis l’interface.

Compte protégé :

`julien`

Règles recommandées :

- ne pas afficher le bouton `Bannir` sur son propre compte ;
- refuser l’action si `target_id = actor_id`;
- refuser le bannissement d’un autre compte admin dans la première version ;
- limiter le test à un compte `member`.

---

## 11. Raison du bannissement

Première version possible :

`reason = Bannissement effectué depuis l’espace admin`

Version améliorée plus tard :

- demander une raison avant confirmation ;
- enregistrer cette raison dans l’historique ;
- afficher la raison seulement dans l’espace admin ;
- conserver une limite de 1 000 caractères.

Exemples :

`Spam répété dans les commentaires.`

`Publication de contenus insultants après avertissement.`

`Compte utilisé pour des tests de sécurité.`

---

## 12. Données à ne pas enregistrer

L’historique ne doit jamais contenir :

- mot de passe ;
- token ;
- clé Supabase ;
- clé `service_role`;
- email privé inutile ;
- donnée Auth sensible ;
- information personnelle non nécessaire ;
- texte complet d’une note interne confidentielle.

Le champ `metadata` doit rester limité à des informations fonctionnelles non sensibles.

---

## 13. RLS et privilèges

La table `moderation_action_history` est déjà protégée.

Configuration vérifiée :

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

Les policies RLS limitent ensuite la lecture et l’insertion aux admins ou futurs modérateurs non bannis.

---

## 14. Historique non modifiable

Aucune ancienne entrée ne doit pouvoir être :

- modifiée ;
- supprimée.

Le bannissement et le débannissement produisent donc deux lignes distinctes.

Exemple :

1. `user_banned`;
2. `user_unbanned`.

---

## 15. Test administrateur

Avec le compte admin `julien` :

1. sélectionner le compte membre de test ;
2. cliquer sur `Bannir`;
3. confirmer ;
4. vérifier que le compte devient banni ;
5. vérifier une entrée `user_banned`;
6. tester que le membre ne peut plus publier, commenter ou uploader ;
7. cliquer sur `Débannir`;
8. vérifier une entrée `user_unbanned`;
9. vérifier que le membre peut à nouveau utiliser son compte.

---

## 16. Test membre

Avec le compte `member` :

- l’espace admin ne doit pas apparaître ;
- la liste des utilisateurs ne doit pas apparaître ;
- le membre ne peut pas bannir ;
- le membre ne peut pas débannir ;
- le membre ne peut pas créer une entrée historique ;
- le membre ne peut pas lire l’historique.

---

## 17. Test visiteur

Avec un visiteur non connecté :

- l’espace admin ne doit pas apparaître ;
- aucune gestion utilisateur ne doit être visible ;
- aucune entrée historique ne doit être accessible ;
- aucun accès anonyme à la table ne doit être autorisé.

---

## 18. Compatibilité avec les fonctions existantes

L’ajout de cet historique ne doit pas interrompre :

- masquer et restaurer un report ;
- masquer et restaurer un commentaire ;
- traitement des signalements ;
- notes internes privées ;
- aperçu du contenu signalé ;
- Voir le contenu ;
- Retour aux signalements ;
- publication des reports ;
- commentaires ;
- photos Supabase Storage.

---

## 19. Ce que cette étape ne fait pas encore

Non inclus dans cette première version :

- bannissement temporaire ;
- date de fin de bannissement ;
- historique détaillé dans `user_bans`;
- envoi d’un email à l’utilisateur ;
- changement de rôle ;
- suppression définitive de compte ;
- suppression automatique des contenus du membre ;
- affichage de l’historique dans l’espace admin.

---

## 20. Amélioration future avec user_bans

La table :

`user_bans`

pourra plus tard conserver :

- raison détaillée ;
- date de début ;
- date de fin ;
- bannissement permanent ou temporaire ;
- administrateur responsable.

Première version actuelle :

`profiles.is_banned = true / false`

Historique associé :

`moderation_action_history`

---

## 21. Ordre de développement recommandé

1. créer ce plan ;
2. faire un backup local ;
3. intégrer `user_banned`;
4. tester le bannissement du compte membre ;
5. vérifier l’entrée historique ;
6. intégrer `user_unbanned`;
7. vérifier la deuxième entrée ;
8. tester membre et visiteur ;
9. documenter ;
10. mettre en ligne si tout est validé.

---

## 22. Décision actuelle

Prochaine extension de l’historique :

`Bannir / Débannir un utilisateur`

Actions prévues :

- `user_banned`;
- `user_unbanned`.

Statut :

`planifié`
