# RailReporters — Plan Voir le contenu signalé V2

## Objectif

Ce document prépare l’ajout d’un bouton admin :

`Voir le contenu`

dans la zone :

`Espace admin RailReporters → Signalements`

La V2 beta est actuellement en ligne sur :

`railreporters.com`

---

## 1. Situation actuelle

L’espace admin affiche déjà un aperçu du contenu signalé.

Pour un report signalé :

- titre ;
- auteur ;
- trajet ;
- date ;
- statut.

Pour un commentaire signalé :

- extrait du commentaire ;
- auteur ;
- report associé ;
- statut.

Les actions suivantes sont également disponibles :

- Masquer le report signalé ;
- Masquer le commentaire signalé ;
- Marquer comme examiné ;
- Rejeter ;
- Action effectuée.

---

## 2. Objectif de l’amélioration

Ajouter un bouton :

`Voir le contenu`

Ce bouton permettra à l’administrateur de consulter le contenu dans son contexte avant de décider d’une action de modération.

Le bouton ne doit pas modifier les données.

Il doit seulement ouvrir ou afficher le contenu concerné.

---

## 3. Report signalé

Si le signalement contient :

`content_type = report`

et :

`content_id = reports.id`

le bouton `Voir le contenu` doit :

1. ouvrir le report concerné ;
2. afficher ses sections ;
3. afficher ses photos ;
4. afficher ses commentaires ;
5. permettre ensuite à l’admin de revenir à la zone Signalements.

---

## 4. Commentaire signalé

Si le signalement contient :

`content_type = comment`

et :

`content_id = comments.id`

le bouton doit :

1. retrouver le commentaire ;
2. retrouver son `report_id`;
3. ouvrir le report associé ;
4. faire défiler la page jusqu’au commentaire ;
5. mettre temporairement le commentaire en évidence.

---

## 5. Première version recommandée

RailReporters ne possède pas encore une URL dédiée pour chaque report.

La première version peut donc utiliser le fonctionnement existant du site :

- ouvrir le report dans la page actuelle ;
- masquer temporairement la liste des reports ;
- afficher le report complet ;
- faire défiler vers le contenu concerné.

Aucune nouvelle page `/report/...` n’est nécessaire pour cette première version.

---

## 6. Mise en évidence du commentaire

Quand un commentaire signalé est ouvert, il peut être mis en évidence temporairement.

Exemple visuel :

- bordure plus visible ;
- fond légèrement différent ;
- mention `Commentaire signalé`;
- disparition de la mise en évidence après quelques secondes.

Cette mise en évidence est uniquement visuelle.

Elle ne modifie pas le commentaire dans Supabase.

---

## 7. Bouton retour vers l’espace admin

Après consultation du contenu, l’administrateur doit pouvoir revenir facilement à :

`Espace admin RailReporters → Signalements`

Bouton recommandé :

`Retour aux signalements`

Le retour doit idéalement conserver la position ou recharger la liste des signalements.

---

## 8. Contenu masqué

Un contenu signalé peut déjà être en :

`status = hidden`

L’administrateur doit quand même pouvoir le consulter si les policies RLS l’autorisent.

L’interface doit alors afficher clairement :

`Contenu actuellement masqué`

Le contenu ne doit pas redevenir public simplement parce que l’admin l’ouvre.

---

## 9. Contenu introuvable

Si le contenu n’existe plus ou ne peut pas être récupéré, afficher :

`Le contenu associé à ce signalement est introuvable.`

Le signalement doit rester visible dans l’espace admin.

L’administrateur doit toujours pouvoir :

- marquer le signalement comme examiné ;
- le rejeter ;
- le marquer comme action effectuée.

---

## 10. Sécurité RLS

La fonction `Voir le contenu` ne doit pas contourner RLS.

Tables concernées :

- `moderation_reports`;
- `reports`;
- `report_sections`;
- `report_photos`;
- `comments`;
- `profiles`.

Règles attendues :

- admin peut consulter les signalements ;
- admin peut consulter les contenus masqués nécessaires à la modération ;
- member ne voit pas l’espace admin ;
- visiteur ne voit pas l’espace admin ;
- utilisateur banni ne possède aucun droit de modération.

---

## 11. Informations à ne pas afficher

Même dans l’espace admin, ne pas afficher :

- mots de passe ;
- tokens ;
- clés privées ;
- données Auth sensibles ;
- informations personnelles inutiles.

Afficher uniquement les informations nécessaires :

- pseudo ;
- rôle ;
- contenu ;
- titre ;
- statut ;
- date ;
- raison du signalement.

---

## 12. Fonctionnement technique conceptuel

### Report signalé

1. récupérer `content_id`;
2. rechercher le report correspondant ;
3. charger ses relations ;
4. ouvrir le report avec la fonction d’affichage existante.

### Commentaire signalé

1. récupérer `content_id`;
2. rechercher le commentaire correspondant ;
3. récupérer son `report_id`;
4. ouvrir le report associé ;
5. trouver l’élément HTML correspondant au commentaire ;
6. faire défiler jusqu’au commentaire.

---

## 13. Identifiant HTML du commentaire

Pour retrouver précisément un commentaire dans la page, chaque commentaire affiché pourra recevoir un identifiant HTML :

`comment-<comment_id>`

Exemple :

`comment-418d...`

Le site pourra ensuite utiliser cet identifiant pour :

- faire défiler la page ;
- ajouter une classe de mise en évidence ;
- retirer la classe après quelques secondes.

---

## 14. Actions admin conservées

Le bouton `Voir le contenu` ne remplace pas les actions existantes.

L’administrateur pourra toujours :

- masquer le report signalé ;
- masquer le commentaire signalé ;
- marquer comme examiné ;
- rejeter ;
- marquer comme action effectuée.

Ordre recommandé :

1. Voir le contenu ;
2. vérifier ;
3. choisir une action ;
4. confirmer l’action.

---

## 15. Messages recommandés

Ouverture réussie :

`Contenu signalé ouvert.`

Commentaire localisé :

`Le commentaire signalé est mis en évidence.`

Contenu introuvable :

`Le contenu associé à ce signalement est introuvable.`

Erreur :

`Impossible d’ouvrir ce contenu pour le moment.`

Ne pas afficher de message technique Supabase brut.

---

## 16. Tests administrateur

Avec le compte admin `julien` :

### Report signalé

- voir le bouton `Voir le contenu`;
- cliquer sur le bouton ;
- vérifier que le bon report s’ouvre ;
- vérifier le titre et l’auteur ;
- revenir aux signalements.

### Commentaire signalé

- voir le bouton `Voir le contenu`;
- cliquer sur le bouton ;
- vérifier que le bon report s’ouvre ;
- vérifier que le bon commentaire est mis en évidence ;
- revenir aux signalements.

---

## 17. Tests membre

Avec un compte `member` :

- l’espace admin ne doit pas apparaître ;
- le bouton `Voir le contenu` admin ne doit pas apparaître ;
- les signalements des autres utilisateurs ne doivent pas être visibles.

---

## 18. Tests visiteur

Avec un visiteur non connecté :

- l’espace admin ne doit pas apparaître ;
- aucun signalement ne doit être visible ;
- aucune fonction admin ne doit être accessible.

---

## 19. Risques à éviter

Risques :

- ouvrir le mauvais report ;
- mettre en évidence le mauvais commentaire ;
- rendre public un contenu masqué ;
- perdre la liste des signalements lors du retour ;
- exposer les signalements à un membre ;
- casser l’affichage normal des reports ;
- modifier le statut sans confirmation.

---

## 20. Ce qu’on ne fait pas encore

Non inclus dans cette première version :

- URL publique dédiée pour chaque report ;
- URL précise vers un commentaire ;
- page `/admin`;
- historique de navigation admin ;
- ouverture dans un nouvel onglet ;
- notification à l’auteur ;
- note admin avancée.

---

## 21. Développement recommandé

Ordre recommandé :

1. faire un backup local ;
2. ajouter le bouton `Voir le contenu`;
3. tester l’ouverture d’un report signalé ;
4. ajouter un identifiant HTML aux commentaires ;
5. tester l’ouverture d’un commentaire signalé ;
6. ajouter la mise en évidence ;
7. ajouter `Retour aux signalements`;
8. tester admin/member/visiteur ;
9. documenter ;
10. mettre en ligne si validé.

---

## 22. Décision actuelle

Prochaine amélioration :

`Voir le contenu signalé`

Première version :

- ouvrir le report concerné ;
- localiser le commentaire concerné ;
- conserver toutes les actions admin existantes.

Statut :

`planifié`
