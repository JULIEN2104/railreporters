# RailReporters — Test aperçu du contenu signalé V2

## Objectif

Ce document garde une trace du test local de l’affichage du contenu concerné par un signalement dans l’espace admin RailReporters.

La V2 beta publique est actuellement en ligne sur :

railreporters.com

La fonction a été testée localement avant toute mise en ligne.

---

## 1. But du test

Vérifier que l’administrateur peut identifier rapidement le contenu concerné par chaque signalement.

Avant cette amélioration, la zone Signalements affichait principalement :

- le type de contenu ;
- la raison ;
- le détail ;
- l’auteur du signalement ;
- la date ;
- le statut.

La nouvelle version affiche également un aperçu du report ou du commentaire signalé.

---

## 2. Report signalé

Pour un signalement avec :

content_type = report

la zone admin affiche maintenant :

- le titre du report ;
- l’auteur du report ;
- le rôle de l’auteur ;
- le trajet ;
- la date du voyage ;
- le statut du report.

Relation utilisée :

profiles.id → reports.user_id

Statut : validé localement.

---

## 3. Commentaire signalé

Pour un signalement avec :

content_type = comment

la zone admin affiche maintenant :

- un extrait du commentaire ;
- l’auteur du commentaire ;
- le rôle de l’auteur ;
- le report associé ;
- le statut du commentaire.

Relations utilisées :

profiles.id → comments.user_id
reports.id → comments.report_id

Statut : validé localement.

---

## 4. Gestion du contenu introuvable

Si le contenu lié au signalement ne peut pas être retrouvé, l’espace admin peut afficher :

Contenu introuvable

Le signalement reste conservé dans la table moderation_reports.

---

## 5. Gestion du contenu déjà masqué

Si le contenu est déjà en statut hidden, l’interface indique que le contenu est déjà masqué.

Cela évite de relancer inutilement une action de modération.

---

## 6. Actions admin conservées

Les actions déjà validées restent disponibles :

- Masquer le report signalé ;
- Masquer le commentaire signalé ;
- Marquer comme examiné ;
- Rejeter ;
- Action effectuée.

L’ajout de l’aperçu ne modifie pas automatiquement le contenu.

L’administrateur reste responsable de la décision.

---

## 7. Test admin

Compte utilisé :

julien

Rôle :

admin

Résultat validé :

- l’espace admin apparaît ;
- la zone Signalements apparaît ;
- les signalements sont affichés ;
- l’aperçu du contenu signalé apparaît ;
- le titre et l’auteur d’un report signalé apparaissent ;
- l’extrait et l’auteur d’un commentaire signalé apparaissent ;
- le statut du contenu apparaît ;
- les actions admin continuent de fonctionner.

Statut : validé localement.

---

## 8. Test membre

Avec un compte member :

- l’espace admin n’apparaît pas ;
- les signalements ne sont pas visibles ;
- les aperçus des contenus signalés ne sont pas visibles ;
- aucune action admin n’est disponible.

Statut : validé localement.

---

## 9. Test visiteur non connecté

Avec un visiteur non connecté :

- l’espace admin n’apparaît pas ;
- les signalements ne sont pas visibles ;
- aucune information de modération n’est visible.

Statut : validé localement.

---

## 10. Sécurité

L’interface masque les données admin aux membres et visiteurs.

La vraie sécurité reste assurée par Supabase RLS.

Tables concernées :

- moderation_reports ;
- reports ;
- comments ;
- profiles.

Les policies doivent continuer à garantir que seuls les rôles admin ou moderator peuvent consulter et traiter l’ensemble des signalements.

---

## 11. Données non affichées

L’espace admin ne doit pas afficher :

- mots de passe ;
- tokens ;
- clés privées ;
- données Auth sensibles ;
- informations personnelles inutiles.

Seules les informations nécessaires à la modération sont affichées.

---

## 12. Ce que ce test valide

Ce test confirme que RailReporters peut :

- relier un signalement au contenu concerné ;
- afficher les informations utiles du report signalé ;
- afficher les informations utiles du commentaire signalé ;
- afficher l’auteur du contenu ;
- afficher le statut du contenu ;
- améliorer la compréhension des signalements par l’admin ;
- conserver les actions de modération existantes.

---

## 13. Ce que ce test ne fait pas encore

Non encore fait :

- mise en ligne de l’aperçu ;
- URL dédiée par report ;
- lien précis vers un commentaire ;
- note admin avancée ;
- historique complet de modération ;
- signalement photo ;
- signalement profil ;
- notifications.

---

## 14. Décision actuelle

Aperçu du contenu signalé : validé localement.

Statut :

aperçu signalements local OK

Prochaine étape recommandée :

vérifier les fichiers locaux actuels puis mettre en ligne l’aperçu du contenu signalé.
