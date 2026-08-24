# RailReporters — Plan historique des notes internes admin V2

## Objectif

Ce document prépare l’extension de l’historique de modération RailReporters à la création et à la modification des notes internes administrateur.

La V2 beta est actuellement en ligne sur :

`railreporters.com`

L’historique couvre déjà :

* masquer et restaurer un report ;
* masquer un report depuis un signalement ;
* masquer et restaurer un commentaire ;
* masquer un commentaire depuis un signalement ;
* bannir et débannir un membre ;
* examiner un signalement ;
* rejeter un signalement ;
* marquer un signalement comme traité.

La prochaine étape consiste à enregistrer :

* la création d’une note interne ;
* la modification d’une note interne.

---

## 1. Table des notes internes

Les notes internes sont stockées dans :

`moderation_report_admin_notes`

Champs principaux :

* `id`;
* `moderation_report_id`;
* `note`;
* `created_by`;
* `updated_by`;
* `created_at`;
* `updated_at`.

Chaque signalement possède au maximum une note modifiable dans cette première version.

---

## 2. Table d’historique

Les actions seront enregistrées dans :

`moderation_action_history`

Les deux types d’action sont déjà autorisés :

* `admin_note_created`;
* `admin_note_updated`.

Aucune nouvelle migration SQL n’est nécessaire.

---

## 3. Création d’une note

Lorsqu’une note interne est créée :

`action_type = admin_note_created`

Valeurs prévues :

* `target_type = admin_note`;
* `target_id = identifiant de la note créée`;
* `moderation_report_id = identifiant du signalement`;
* `actor_id = identifiant de l’administrateur`;
* `previous_status = null`;
* `new_status = null`;
* `created_at = date de l’action`.

Le texte confidentiel de la note ne doit pas être recopié dans l’historique.

---

## 4. Modification d’une note

Lorsqu’une note interne existante est modifiée :

`action_type = admin_note_updated`

Valeurs prévues :

* `target_type = admin_note`;
* `target_id = identifiant de la note existante`;
* `moderation_report_id = identifiant du signalement`;
* `actor_id = identifiant de l’administrateur`;
* `previous_status = null`;
* `new_status = null`;
* `created_at = date de l’action`.

Une modification ajoute une nouvelle entrée historique sans remplacer l’entrée `admin_note_created`.

---

## 5. Pourquoi ne pas utiliser previous_status et new_status

La création ou la modification d’une note n’est pas un changement de statut.

Les champs suivants doivent donc rester vides :

* `previous_status`;
* `new_status`.

Les informations complémentaires seront enregistrées dans `metadata`.

---

## 6. Métadonnées autorisées

Pour une création, `metadata` pourra contenir :

* `source = admin_dashboard`;
* `note_length = nombre de caractères`;
* `operation = created`.

Pour une modification :

* `source = admin_dashboard`;
* `previous_length = ancienne longueur`;
* `new_length = nouvelle longueur`;
* `operation = updated`.

Ces informations permettent de confirmer qu’une note a changé sans révéler son contenu.

---

## 7. Données interdites dans l’historique

Ne jamais recopier dans `moderation_action_history` :

* le texte complet de la note ;
* un extrait confidentiel de la note ;
* un mot de passe ;
* un token ;
* une clé Supabase ;
* une clé `service_role`;
* une donnée Auth sensible ;
* une information personnelle inutile.

La note complète doit rester uniquement dans :

`moderation_report_admin_notes`

---

## 8. Champ reason

Le champ `reason` peut contenir un libellé non confidentiel.

Pour une création :

`Note interne créée depuis l’espace admin`

Pour une modification :

`Note interne mise à jour depuis l’espace admin`

Le champ `reason` ne doit pas contenir le texte de la note.

---

## 9. Ordre de fonctionnement — création

Ordre recommandé :

1. vérifier que la zone de texte n’est pas vide ;
2. vérifier la limite de 1 000 caractères ;
3. créer la note dans `moderation_report_admin_notes`;
4. récupérer la ligne créée et son identifiant ;
5. vérifier que la création a réussi ;
6. ajouter `admin_note_created` dans l’historique ;
7. recharger la carte du signalement ;
8. afficher le résultat à l’administrateur.

---

## 10. Ordre de fonctionnement — modification

Ordre recommandé :

1. récupérer la note existante ;
2. comparer l’ancien texte et le nouveau texte ;
3. refuser une mise à jour si le texte est identique ;
4. vérifier la limite de 1 000 caractères ;
5. modifier la note existante ;
6. mettre à jour `updated_by` et `updated_at`;
7. récupérer la ligne modifiée ;
8. ajouter `admin_note_updated` dans l’historique ;
9. recharger la carte du signalement ;
10. afficher le résultat à l’administrateur.

---

## 11. Prévention des mises à jour inutiles

Si le texte saisi est identique à la note existante :

* ne pas envoyer d’`UPDATE`;
* ne pas modifier `updated_at`;
* ne pas ajouter `admin_note_updated`;
* afficher un message clair.

Message recommandé :

`Aucune modification n’a été détectée dans la note.`

Cela évite les entrées historiques inutiles.

---

## 12. Priorité de l’action principale

La création ou la modification de la note reste prioritaire.

Si la note est correctement enregistrée, mais que l’écriture de l’historique échoue, afficher un avertissement distinct.

Après création :

`Note interne enregistrée, mais l’historique n’a pas pu être mis à jour.`

Après modification :

`Note interne mise à jour, mais l’historique n’a pas pu être enregistré.`

Le site ne doit pas prétendre que la note a échoué si elle est déjà enregistrée dans Supabase.

---

## 13. Messages après réussite complète

Après création :

`Note interne enregistrée et action ajoutée à l’historique.`

Après modification :

`Note interne mise à jour et action ajoutée à l’historique.`

Ces messages confirment séparément :

* l’enregistrement de la note ;
* l’enregistrement de l’action historique.

---

## 14. Administrateur responsable

Le champ :

`actor_id`

doit correspondre à l’administrateur connecté.

Compte actuel :

`julien`

Rôle :

`admin`

La table des notes conserve également :

* `created_by`;
* `updated_by`.

L’historique permettra plus tard d’afficher :

`Note créée par julien`

`Note mise à jour par julien`

---

## 15. Signalement concerné

Le champ :

`moderation_report_id`

doit contenir l’identifiant du signalement auquel la note est liée.

Cela permettra de relier :

* le signalement ;
* la note privée ;
* l’action historique ;
* l’administrateur ;
* la date.

---

## 16. Indépendance du statut du signalement

Créer ou modifier une note ne doit jamais modifier automatiquement :

* `moderation_reports.status`;
* `moderation_reports.reviewed_at`;
* le statut du report signalé ;
* le statut du commentaire signalé ;
* le statut de l’utilisateur concerné.

Les actions suivantes restent séparées :

* Marquer comme examiné ;
* Rejeter ;
* Action effectuée ;
* Masquer le contenu signalé.

---

## 17. Historique non modifiable

Chaque création ou modification de note ajoute une nouvelle ligne.

Exemple :

1. `admin_note_created`;
2. `admin_note_updated`;
3. `admin_note_updated`.

Les anciennes entrées restent conservées.

Elles ne peuvent pas être :

* modifiées ;
* supprimées depuis le frontend.

---

## 18. RLS des notes internes

RLS est activé sur :

`moderation_report_admin_notes`

Policies présentes :

* création réservée aux admins et modérateurs ;
* lecture réservée aux admins et modérateurs ;
* modification réservée aux admins et modérateurs.

Les membres et visiteurs n’ont aucun accès aux notes privées.

---

## 19. RLS de l’historique

RLS est également activé sur :

`moderation_action_history`

Les policies autorisent uniquement les admins ou futurs modérateurs non bannis à :

* lire l’historique ;
* ajouter une entrée.

Aucun droit frontend de modification ou de suppression n’existe.

---

## 20. Test — création d’une note

Avec le compte admin `julien` :

1. choisir un signalement sans note ;
2. écrire une note de test ;
3. cliquer sur `Enregistrer la note`;
4. vérifier que la note est conservée ;
5. vérifier une entrée `admin_note_created`;
6. vérifier le bon `target_id`;
7. vérifier le bon `moderation_report_id`;
8. vérifier le bon `actor_id`;
9. vérifier que le texte de la note n’apparaît pas dans l’historique.

---

## 21. Test — modification d’une note

Avec une note existante :

1. modifier le texte ;
2. cliquer sur `Mettre à jour la note`;
3. vérifier la nouvelle valeur ;
4. vérifier `updated_at`;
5. vérifier une entrée `admin_note_updated`;
6. vérifier `previous_length`;
7. vérifier `new_length`;
8. vérifier que l’ancienne entrée historique reste intacte.

---

## 22. Test — texte identique

Avec une note existante :

1. ne modifier aucun caractère ;
2. cliquer sur le bouton de mise à jour.

Résultat attendu :

`Aucune modification n’a été détectée dans la note.`

Aucune nouvelle ligne `admin_note_updated` ne doit être créée.

---

## 23. Test membre

Avec un compte `member` :

* l’espace admin ne doit pas apparaître ;
* les notes ne doivent pas être visibles ;
* le membre ne doit pas lire la table des notes ;
* le membre ne doit pas lire l’historique ;
* le membre ne doit créer aucune entrée.

---

## 24. Test visiteur

Avec un visiteur non connecté :

* l’espace admin ne doit pas apparaître ;
* aucune note privée ne doit être visible ;
* aucun historique ne doit être accessible ;
* aucun privilège anonyme ne doit être accordé.

---

## 25. Compatibilité avec les fonctions existantes

L’ajout de cet historique ne doit pas interrompre :

* signaler un report ;
* signaler un commentaire ;
* voir le contenu signalé ;
* retourner aux signalements ;
* traiter un signalement ;
* masquer ou restaurer un report ;
* masquer ou restaurer un commentaire ;
* bannir ou débannir un membre ;
* historiques déjà déployés ;
* publication, photos et commentaires normaux.

---

## 26. Ce que cette étape ne fait pas encore

Non inclus dans cette première version :

* plusieurs notes distinctes par signalement ;
* suppression d’une note ;
* restauration d’une ancienne version ;
* affichage complet de toutes les versions de la note ;
* comparaison textuelle des anciennes versions ;
* notification à un autre modérateur ;
* affichage de l’historique dans l’espace admin.

---

## 27. Ordre de développement recommandé

1. créer ce plan ;
2. faire un backup local ;
3. intégrer `admin_note_created`;
4. tester la création ;
5. intégrer `admin_note_updated`;
6. tester la modification ;
7. ajouter la prévention du texte identique ;
8. vérifier qu’aucun contenu confidentiel n’est copié ;
9. tester admin, membre et visiteur ;
10. documenter ;
11. mettre en ligne après validation.

---

## 28. Décision actuelle

Prochaine extension de l’historique :

`Création et modification des notes internes admin`

Actions prévues :

* `admin_note_created`;
* `admin_note_updated`.

Principe de confidentialité :

`ne jamais recopier le texte de la note dans l’historique`

Statut :

`planifié`
