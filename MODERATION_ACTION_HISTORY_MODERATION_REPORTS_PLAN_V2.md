# RailReporters — Plan historique des statuts de signalement V2

## Objectif

Ce document prépare l’extension de l’historique de modération RailReporters aux changements de statut des signalements.

La V2 beta est actuellement en ligne sur :

`railreporters.com`

L’historique couvre déjà :

- masquer un report ;
- restaurer un report ;
- masquer un report depuis un signalement ;
- masquer un commentaire ;
- restaurer un commentaire ;
- masquer un commentaire depuis un signalement ;
- bannir un membre ;
- débannir un membre.

La prochaine étape est d’enregistrer :

- un signalement marqué comme examiné ;
- un signalement rejeté ;
- un signalement marqué comme action effectuée.

---

## 1. Table des signalements

Les signalements sont stockés dans :

`moderation_reports`

Le champ concerné est :

`status`

Statuts actuellement utilisés :

- `pending`;
- `reviewed`;
- `rejected`;
- `action_taken`.

---

## 2. Table d’historique

Les actions seront enregistrées dans :

`moderation_action_history`

Chaque changement de statut ajoutera une nouvelle ligne indépendante.

Les anciennes entrées ne seront ni remplacées ni supprimées.

---

## 3. Signalement marqué comme examiné

Action actuelle dans l’espace admin :

`Marquer comme examiné`

Modification du signalement :

`moderation_reports.status = reviewed`

Entrée historique prévue :

- `action_type = moderation_report_reviewed`;
- `target_type = moderation_report`;
- `target_id = identifiant du signalement`;
- `moderation_report_id = même identifiant`;
- `previous_status = statut réel avant modification`;
- `new_status = reviewed`;
- `actor_id = identifiant de l’administrateur`;
- `created_at = date de l’action`.

---

## 4. Signalement rejeté

Action actuelle dans l’espace admin :

`Rejeter`

Modification du signalement :

`moderation_reports.status = rejected`

Entrée historique prévue :

- `action_type = moderation_report_rejected`;
- `target_type = moderation_report`;
- `target_id = identifiant du signalement`;
- `moderation_report_id = même identifiant`;
- `previous_status = statut réel avant modification`;
- `new_status = rejected`;
- `actor_id = identifiant de l’administrateur`;
- `created_at = date de l’action`.

Le statut précédent pourra notamment être :

- `pending`;
- `reviewed`.

---

## 5. Signalement marqué comme action effectuée

Action actuelle dans l’espace admin :

`Action effectuée`

Modification du signalement :

`moderation_reports.status = action_taken`

Entrée historique prévue :

- `action_type = moderation_report_action_taken`;
- `target_type = moderation_report`;
- `target_id = identifiant du signalement`;
- `moderation_report_id = même identifiant`;
- `previous_status = statut réel avant modification`;
- `new_status = action_taken`;
- `actor_id = identifiant de l’administrateur`;
- `created_at = date de l’action`.

Le statut précédent pourra notamment être :

- `pending`;
- `reviewed`.

---

## 6. Actions combinées avec un masquage

RailReporters permet déjà de masquer directement un report ou un commentaire depuis un signalement.

Ces actions sont déjà enregistrées avec :

- `report_hidden_from_moderation_report`;
- `comment_hidden_from_moderation_report`.

Ces entrées contiennent déjà :

- le contenu modéré ;
- le signalement concerné ;
- l’administrateur ;
- l’ancien statut du contenu ;
- le nouveau statut du contenu.

Décision recommandée :

Ne pas créer en plus une deuxième entrée générique `moderation_report_action_taken` lors de la même action combinée.

Objectifs :

- éviter deux lignes décrivant la même décision ;
- conserver une entrée précise indiquant quel contenu a été masqué ;
- réserver `moderation_report_action_taken` au bouton administratif utilisé sans masquage automatique.

---

## 7. Identifiant du signalement

Pour les trois actions de changement de statut :

`target_type = moderation_report`

Le champ :

`target_id`

contient l’identifiant du signalement.

Le champ :

`moderation_report_id`

contient également cet identifiant afin de faciliter les futures recherches et relations.

---

## 8. Administrateur responsable

Le champ :

`actor_id`

doit contenir l’identifiant du profil administrateur connecté.

Compte actuel :

`julien`

Rôle :

`admin`

Cela permettra plus tard d’afficher :

`Signalement examiné par julien`

`Signalement rejeté par julien`

`Signalement traité par julien`

---

## 9. Date de traitement

La modification du signalement doit continuer à renseigner :

`reviewed_at`

avec la date et l’heure de l’action.

L’entrée historique conservera séparément :

`created_at`

Les deux dates doivent correspondre approximativement à la même action administrative.

---

## 10. Ancien et nouveau statut

L’historique doit enregistrer le véritable statut avant la modification.

Exemples possibles :

`pending → reviewed`

`pending → rejected`

`reviewed → rejected`

`pending → action_taken`

`reviewed → action_taken`

Le code ne doit pas supposer systématiquement que le statut précédent est `pending`.

---

## 11. Prévention des actions inutiles

Avant de modifier le signalement, RailReporters doit vérifier son statut actuel.

Exemples :

- un signalement déjà `reviewed` ne doit pas générer un deuxième `moderation_report_reviewed`;
- un signalement déjà `rejected` ne doit pas générer un deuxième `moderation_report_rejected`;
- un signalement déjà `action_taken` ne doit pas générer un deuxième `moderation_report_action_taken`.

Message possible :

`Ce signalement possède déjà ce statut.`

---

## 12. Ordre de fonctionnement

Ordre recommandé :

1. récupérer le statut actuel du signalement ;
2. vérifier que le changement est nécessaire ;
3. modifier `moderation_reports.status`;
4. renseigner `reviewed_at`;
5. vérifier que la modification a réussi ;
6. ajouter une entrée dans `moderation_action_history`;
7. actualiser la liste des signalements ;
8. afficher le résultat à l’administrateur.

---

## 13. Priorité de l’action principale

L’action principale reste prioritaire.

Si le statut du signalement est correctement modifié mais que l’historique échoue, RailReporters doit afficher un avertissement distinct.

Après examen :

`Signalement marqué comme examiné, mais l’historique n’a pas pu être enregistré.`

Après rejet :

`Signalement rejeté, mais l’historique n’a pas pu être enregistré.`

Après traitement :

`Signalement marqué comme traité, mais l’historique n’a pas pu être enregistré.`

Le site ne doit pas présenter le changement de statut comme ayant échoué si la base a déjà été modifiée.

---

## 14. Messages après réussite complète

Après examen :

`Signalement marqué comme examiné et action enregistrée dans l’historique.`

Après rejet :

`Signalement rejeté et action enregistrée dans l’historique.`

Après traitement :

`Signalement marqué comme traité et action enregistrée dans l’historique.`

---

## 15. Champ reason

Première version possible :

`reason = Changement de statut depuis l’espace admin`

Le champ peut aussi rester vide si aucune raison particulière n’est demandée.

Version future :

- demander un motif lors du rejet ;
- demander une conclusion lors du traitement ;
- limiter le texte à 1 000 caractères ;
- afficher cette raison uniquement dans l’espace admin.

---

## 16. Champ metadata

Le champ `metadata` pourra contenir des informations fonctionnelles non sensibles comme :

- `source = admin_dashboard`;
- `content_type = report` ou `comment`;
- `content_id = identifiant du contenu signalé`;
- `reason_code = raison initiale du signalement`.

Ne jamais enregistrer dans `metadata` :

- mot de passe ;
- token ;
- clé Supabase ;
- clé `service_role`;
- donnée Auth sensible ;
- texte complet d’une note interne confidentielle ;
- information personnelle inutile.

---

## 17. RLS et privilèges

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

Les policies RLS limitent ensuite la lecture et la création aux administrateurs ou futurs modérateurs non bannis.

---

## 18. Historique non modifiable

Chaque changement de statut produit une nouvelle ligne.

Les anciennes entrées ne peuvent pas être :

- modifiées ;
- supprimées.

Exemple :

1. `moderation_report_reviewed`;
2. puis `moderation_report_action_taken`.

La deuxième action ne supprime pas la trace de la première.

---

## 19. Compatibilité avec les fonctions existantes

L’ajout de cet historique ne doit pas interrompre :

- signaler un report ;
- signaler un commentaire ;
- voir les signalements ;
- aperçu du contenu signalé ;
- Voir le contenu ;
- Retour aux signalements ;
- masquer directement le contenu signalé ;
- notes internes privées ;
- historique des reports ;
- historique des commentaires ;
- historique des bannissements ;
- publication, photos et commentaires normaux.

---

## 20. Test — Marquer comme examiné

Avec le compte admin `julien` :

1. choisir un signalement `pending`;
2. cliquer sur `Marquer comme examiné`;
3. vérifier `status = reviewed`;
4. vérifier `reviewed_at`;
5. vérifier une entrée `moderation_report_reviewed`;
6. vérifier `previous_status = pending`;
7. vérifier `new_status = reviewed`.

---

## 21. Test — Rejeter

Avec un signalement de test :

1. partir de `pending` ou `reviewed`;
2. cliquer sur `Rejeter`;
3. vérifier `status = rejected`;
4. vérifier une entrée `moderation_report_rejected`;
5. vérifier le véritable statut précédent ;
6. vérifier `new_status = rejected`.

---

## 22. Test — Action effectuée

Avec un signalement de test :

1. partir de `pending` ou `reviewed`;
2. cliquer sur `Action effectuée`;
3. vérifier `status = action_taken`;
4. vérifier une entrée `moderation_report_action_taken`;
5. vérifier le véritable statut précédent ;
6. vérifier `new_status = action_taken`.

---

## 23. Test membre

Avec un compte `member` :

- l’espace admin ne doit pas apparaître ;
- le membre ne doit pas traiter un signalement ;
- le membre ne doit pas créer une entrée historique ;
- le membre ne doit pas lire l’historique.

---

## 24. Test visiteur

Avec un visiteur non connecté :

- l’espace admin ne doit pas apparaître ;
- aucun signalement admin ne doit être visible ;
- aucun historique ne doit être accessible ;
- aucun privilège anonyme ne doit être disponible.

---

## 25. Ce que cette étape ne fait pas encore

Non inclus dans cette première version :

- motif obligatoire lors du rejet ;
- conclusion obligatoire lors du traitement ;
- plusieurs administrateurs simultanés ;
- affichage de l’historique dans l’espace admin ;
- filtres avancés ;
- historique des notes internes ;
- notifications.

---

## 26. Ordre de développement recommandé

1. créer ce plan ;
2. faire un backup local ;
3. intégrer `moderation_report_reviewed`;
4. tester ;
5. intégrer `moderation_report_rejected`;
6. tester ;
7. intégrer `moderation_report_action_taken`;
8. tester ;
9. vérifier les actions combinées avec le masquage ;
10. documenter ;
11. mettre en ligne si tout est validé.

---

## 27. Décision actuelle

Prochaine extension de l’historique :

`Changements de statut des signalements`

Actions prévues :

- `moderation_report_reviewed`;
- `moderation_report_rejected`;
- `moderation_report_action_taken`.

Statut :

`planifié`
