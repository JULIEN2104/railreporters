# RailReporters — Plan note interne admin sur signalement V2

## Objectif

Ce document prépare l’ajout d’une note interne administrateur sur chaque signalement RailReporters.

La V2 beta est actuellement en ligne sur :

`railreporters.com`

Les fonctions suivantes sont déjà disponibles :

- Signaler un report ;
- Signaler un commentaire ;
- Voir les signalements ;
- Voir un aperçu du contenu signalé ;
- Ouvrir le contenu signalé ;
- Masquer le contenu signalé ;
- Marquer comme examiné ;
- Rejeter ;
- Marquer comme action effectuée.

---

## 1. Structure existante

La table :

`moderation_reports`

contient déjà les colonnes :

- `status`;
- `admin_note`;
- `reviewed_at`.

Vérification Supabase réalisée :

- `status` : text, obligatoire, valeur par défaut `pending`;
- `admin_note` : text, facultative ;
- `reviewed_at` : timestamp avec fuseau horaire, facultative.

Aucune migration de cette table n’est nécessaire pour son fonctionnement actuel.

---

## 2. Point de sécurité important

Une policy permet actuellement à un utilisateur de lire ses propres signalements :

`Users can read their own moderation reports`

Cette policy autorise la lecture de la ligne du signalement par son auteur.

RLS protège les lignes mais ne masque pas automatiquement certaines colonnes d’une ligne autorisée.

Par conséquent, la colonne `admin_note` de `moderation_reports` ne doit pas être utilisée directement pour une note strictement confidentielle tant qu’elle peut être récupérée par l’auteur du signalement.

---

## 3. Décision de sécurité

Pour les notes internes privées, créer plus tard une table séparée :

`moderation_report_admin_notes`

Cette table sera accessible uniquement aux rôles :

- `admin`;
- éventuellement `moderator` plus tard.

Les membres et visiteurs ne devront avoir aucun droit de lecture sur cette table.

---

## 4. Structure recommandée de la nouvelle table

Première version proposée :

- `id` : uuid ;
- `moderation_report_id` : uuid ;
- `note` : text ;
- `created_by` : uuid ;
- `updated_by` : uuid facultatif ;
- `created_at` : timestamp ;
- `updated_at` : timestamp.

Relation principale :

`moderation_reports.id → moderation_report_admin_notes.moderation_report_id`

Un seul enregistrement de note pourra être associé à un signalement dans la première version.

---

## 5. Pourquoi utiliser une table séparée

Avantages :

- la note reste invisible aux membres ;
- la policy de lecture des propres signalements peut rester active ;
- aucune donnée interne n’est exposée via `moderation_reports`;
- la sécurité est plus facile à vérifier ;
- un historique de notes pourra être ajouté plus tard ;
- les fonctions publiques de signalement ne sont pas perturbées.

---

## 6. Zone prévue dans l’espace admin

Dans chaque carte de signalement, ajouter :

`Note interne admin`

Éléments prévus :

- une zone de texte ;
- un bouton `Enregistrer la note`;
- un message de confirmation ;
- la dernière date de modification ;
- éventuellement le pseudo de l’admin ayant modifié la note.

La note ne doit apparaître que dans :

`Espace admin RailReporters → Signalements`

---

## 7. Contenu possible d’une note

Exemples :

`Commentaire vérifié : contenu insultant, commentaire masqué.`

`Signalement rejeté : le contenu respecte les règles du site.`

`Report vérifié. L’auteur a été contacté avant décision.`

`Utilisateur déjà averti pour un comportement similaire.`

La note doit rester factuelle et utile à la modération.

---

## 8. Enregistrement de la note

Première version :

- si aucune note n’existe, créer une ligne ;
- si une note existe déjà, la mettre à jour ;
- associer la note au bon signalement ;
- enregistrer l’identifiant de l’admin ;
- enregistrer la date de modification.

Le bouton d’enregistrement doit cibler uniquement le signalement concerné.

---

## 9. Indépendance du statut

Enregistrer une note ne doit pas modifier automatiquement :

- `status`;
- `reviewed_at`;
- le report signalé ;
- le commentaire signalé ;
- le statut de l’utilisateur.

Exemple :

`status = pending`

peut rester inchangé après l’ajout d’une note.

L’admin choisira séparément :

- Marquer comme examiné ;
- Rejeter ;
- Action effectuée ;
- Masquer le contenu.

---

## 10. Longueur recommandée

Première limite d’interface recommandée :

`1000 caractères`

Objectifs :

- garder des notes lisibles ;
- éviter des textes inutilement longs ;
- limiter les erreurs de saisie.

Une contrainte SQL pourra être ajoutée plus tard si nécessaire.

---

## 11. Messages administrateur

Après enregistrement :

`Note interne enregistrée.`

Après modification :

`Note interne mise à jour.`

En cas d’erreur :

`Impossible d’enregistrer la note pour le moment.`

Éviter d’afficher une erreur technique Supabase brute.

---

## 12. RLS de la future table

La table `moderation_report_admin_notes` devra avoir RLS activé.

Règles attendues :

- admin peut lire toutes les notes ;
- admin peut créer une note ;
- admin peut modifier une note ;
- moderator pourra éventuellement lire et modifier plus tard ;
- member ne peut lire aucune note ;
- member ne peut créer aucune note ;
- visiteur ne peut lire aucune note ;
- utilisateur banni ne possède aucun droit admin.

Aucune policy de lecture publique ne devra être créée.

---

## 13. Protection du compte membre

Un membre ne doit jamais pouvoir :

- récupérer une note interne ;
- créer une note ;
- modifier une note ;
- supprimer une note ;
- connaître son contenu via l’API publique.

La note ne doit pas être incluse dans les requêtes publiques utilisées pour afficher les signalements de l’utilisateur.

---

## 14. Test administrateur

Avec le compte admin `julien` :

- voir la zone `Note interne admin`;
- écrire une note ;
- enregistrer ;
- recharger la page ;
- vérifier que la note est toujours présente ;
- modifier la note ;
- vérifier la nouvelle date de modification ;
- vérifier que le statut du signalement n’a pas changé.

---

## 15. Test membre

Avec un compte `member` :

- l’espace admin ne doit pas apparaître ;
- la note ne doit pas apparaître ;
- aucune requête membre ne doit retourner la note ;
- aucune action de création ou modification ne doit être autorisée.

---

## 16. Test visiteur

Avec un visiteur non connecté :

- aucun signalement admin ne doit apparaître ;
- aucune note interne ne doit apparaître ;
- aucune requête anonyme ne doit pouvoir lire la table des notes.

---

## 17. Historique futur

La première version utilisera une note modifiable par signalement.

Une version future pourra conserver un historique :

- note ajoutée ;
- auteur de la note ;
- date ;
- ancienne valeur ;
- nouvelle valeur ;
- action de modération associée.

Cet historique n’est pas nécessaire dans la première version.

---

## 18. Colonne admin_note existante

La colonne existante :

`moderation_reports.admin_note`

reste présente pour le moment.

Décision recommandée :

- ne pas y enregistrer de note confidentielle ;
- ne pas la supprimer immédiatement ;
- créer d’abord la table privée ;
- vérifier toutes les policies ;
- décider plus tard si la colonne peut être supprimée ou réutilisée.

---

## 19. Ordre de développement recommandé

1. documenter le plan ;
2. créer la table privée des notes ;
3. activer RLS sur cette table ;
4. créer les policies admin ;
5. vérifier les policies ;
6. faire un backup local ;
7. ajouter la zone Note interne admin ;
8. tester en local avec admin ;
9. tester avec member et visiteur ;
10. documenter ;
11. mettre en ligne si tout est validé.

---

## 20. Décision actuelle

Prochaine amélioration :

`Note interne admin sur un signalement`

Décision de sécurité :

`utiliser une table privée séparée`

Statut :

`planifié`
