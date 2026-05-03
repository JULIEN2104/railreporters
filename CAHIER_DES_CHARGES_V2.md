# RailReporters — Cahier des charges V2 communautaire

## 1. Objectif de la V2

La V2 de RailReporters doit transformer le prototype actuel en vraie plateforme communautaire.

La V1.2 permet déjà de tester le concept, le design, la création de reports, les photos, les commentaires et la navigation.  
Mais les données sont encore stockées localement dans le navigateur de chaque utilisateur.

La V2 doit permettre :

- la création de comptes utilisateurs ;
- la publication de reports visibles par tous ;
- le stockage des photos côté serveur ;
- les commentaires partagés entre utilisateurs ;
- la modération des contenus ;
- la gestion des rôles administrateur / membre ;
- une base technique plus propre et transférable.

---

## 2. Types d’utilisateurs

### Visiteur

Un visiteur peut :

- consulter les reports publiés ;
- utiliser la recherche ;
- lire les commentaires ;
- consulter les photos ;
- voir les informations de trajet.

Un visiteur ne peut pas :

- publier un report ;
- commenter ;
- supprimer du contenu ;
- accéder aux outils de modération.

### Membre connecté

Un membre connecté peut :

- créer un report ;
- ajouter des photos ;
- publier un commentaire ;
- gérer ses propres reports ;
- modifier son profil ;
- supprimer ses propres brouillons ou reports selon les règles du site.

### Administrateur

L’administrateur peut :

- voir tous les reports ;
- masquer un report ;
- supprimer un report inadapté ;
- supprimer un commentaire ;
- gérer les signalements ;
- bloquer ou bannir un utilisateur ;
- gérer les rôles ;
- intervenir officiellement avec un badge administrateur.

---

## 3. Authentification

La V2 doit inclure :

- inscription par email ;
- connexion par email ;
- mot de passe sécurisé ;
- récupération de mot de passe ;
- session utilisateur persistante ;
- profil utilisateur.

À terme, on pourra envisager :

- connexion Google ;
- connexion Apple ;
- connexion par lien magique.

---

## 4. Profil utilisateur

Chaque utilisateur doit avoir :

- pseudo ;
- photo de profil ;
- bio courte ;
- pays ou ville optionnelle ;
- nombre de reports publiés ;
- date d’inscription ;
- liste de ses reports ;
- rôle : membre, modérateur, administrateur.

---

## 5. Structure d’un report

Un report doit contenir :

### Informations générales

- titre ;
- auteur ;
- train ;
- opérateur ;
- gare de départ ;
- heure de départ ;
- gare d’arrivée ;
- heure d’arrivée ;
- date du voyage ;
- classe ;
- photo d’accueil ;
- note globale.

### Sections du voyage

Chaque report peut contenir les sections suivantes :

1. Arrivée en gare
2. Expérience en gare
3. Embarquement
4. À bord du train
5. Services à bord
6. Arrivée à destination
7. Conclusion

Chaque section peut contenir :

- texte ;
- une ou plusieurs photos.

---

## 6. Photos

La V2 doit gérer les photos côté serveur.

Objectifs :

- compresser les photos avant envoi ;
- stocker les photos dans un service dédié ;
- limiter le poids maximum ;
- limiter le nombre de photos par report ;
- afficher les photos rapidement ;
- éviter de stocker les images dans le navigateur.

Contraintes recommandées :

- largeur maximale : environ 1600 px ;
- format JPEG ou WebP ;
- compression automatique ;
- taille maximum par image à définir ;
- suppression possible par l’auteur ou l’administrateur.

---

## 7. Commentaires

Les commentaires doivent être visibles par tous.

Un membre connecté peut :

- écrire un commentaire ;
- répondre à un commentaire ;
- supprimer ses propres commentaires si autorisé.

L’auteur du report peut répondre aux commentaires.

L’administrateur peut :

- masquer un commentaire ;
- supprimer un commentaire ;
- sanctionner un utilisateur abusif.

---

## 8. Modération

La modération est essentielle pour protéger la plateforme.

La V2 doit prévoir :

- bouton “Signaler” sur un report ;
- bouton “Signaler” sur un commentaire ;
- raisons de signalement :
  - insulte ;
  - propos discriminatoire ;
  - sexisme ;
  - spam ;
  - photo inadaptée ;
  - contenu hors sujet ;
  - autre raison.

L’administrateur doit pouvoir :

- voir les signalements ;
- masquer le contenu ;
- supprimer le contenu ;
- bloquer l’utilisateur ;
- bannir l’utilisateur ;
- ajouter une note interne de modération.

---

## 9. Rôles et permissions

Rôles prévus :

- visiteur ;
- membre ;
- modérateur ;
- administrateur.

Règles générales :

- un visiteur lit seulement ;
- un membre publie et commente ;
- un modérateur gère les signalements ;
- un administrateur a accès à toute la modération.

La base de données devra protéger les données avec des règles de sécurité adaptées.

---

## 10. Base de données envisagée

La V2 utilisera une vraie base de données.

Tables principales envisagées :

### users / profiles

- id ;
- pseudo ;
- photo ;
- bio ;
- rôle ;
- date de création.

### reports

- id ;
- user_id ;
- title ;
- train ;
- operator ;
- departure_station ;
- departure_time ;
- arrival_station ;
- arrival_time ;
- travel_date ;
- travel_class ;
- cover_photo_url ;
- rating ;
- conclusion ;
- status ;
- created_at ;
- updated_at.

### report_sections

- id ;
- report_id ;
- section_type ;
- title ;
- content ;
- position ;
- created_at.

### report_photos

- id ;
- report_id ;
- section_id ;
- photo_url ;
- caption ;
- created_at.

### comments

- id ;
- report_id ;
- user_id ;
- parent_comment_id ;
- content ;
- status ;
- created_at.

### reports_flags / moderation_reports

- id ;
- content_type ;
- content_id ;
- reported_by ;
- reason ;
- status ;
- admin_note ;
- created_at.

---

## 11. Statuts des reports

Un report peut avoir plusieurs statuts :

- brouillon ;
- publié ;
- masqué ;
- supprimé ;
- en attente de modération.

Au début, on peut publier directement.

Plus tard, on pourra prévoir une validation manuelle ou semi-automatique.

---

## 12. Sécurité

La V2 doit prévoir :

- mots de passe non accessibles à l’administrateur ;
- permissions par rôle ;
- protection des reports par auteur ;
- règles pour empêcher un utilisateur de modifier le report d’un autre ;
- règles pour empêcher un utilisateur de supprimer les commentaires d’un autre ;
- modération côté administrateur ;
- sauvegarde régulière des données.

---

## 13. SEO

RailReporters doit être pensé pour le référencement.

Chaque report devrait pouvoir avoir :

- URL propre ;
- titre unique ;
- description ;
- trajet ;
- opérateur ;
- date ;
- photos optimisées ;
- texte riche.

Exemples d’URL possibles :

- /reports/tgv-paris-lyon-premiere-classe
- /reports/eurostar-paris-londres-standard-premier
- /reports/ice-berlin-munich

---

## 14. Monétisation future

La publicité n’est pas prioritaire maintenant.

À terme, RailReporters pourra prévoir :

- emplacements partenaires ;
- affiliation billets de train ;
- partenariats voyages ;
- contenus sponsorisés ;
- newsletter ;
- pages opérateurs / gares.

Les publicités devront rester discrètes et ne pas nuire à la lecture des reports.

---

## 15. Ce qu’on garde de la V1.2

On conserve :

- idée générale du site ;
- structure “report complet” ;
- carte visuelle du trajet ;
- sections du voyage ;
- photo d’accueil ;
- commentaires ;
- recherche ;
- design coloré ;
- domaine railreporters.com ;
- GitHub ;
- Vercel.

---

## 16. Ce qu’on ne fait pas tout de suite

À ne pas faire immédiatement :

- système de paiement ;
- publicité ;
- newsletter ;
- application mobile native ;
- carte ferroviaire réelle avancée ;
- traduction anglaise ;
- système de badges complexe ;
- algorithme de classement avancé.

---

## 17. Priorités de développement V2

### Priorité 1

- Authentification utilisateur
- Base de données reports
- Stockage photos
- Reports visibles par tous
- Publication liée à un compte

### Priorité 2

- Commentaires partagés
- Profils utilisateurs
- Modération simple
- Suppression / masquage admin

### Priorité 3

- Signalements
- Rôles modérateur
- SEO avancé
- Pages dédiées report
- Amélioration du design

### Priorité 4

- Monétisation
- Traduction anglaise
- Statistiques
- Fonctionnalités avancées

---

## 18. Objectif stratégique

RailReporters doit devenir une plateforme communautaire de référence pour les expériences ferroviaires.

Le projet doit rester :

- transférable ;
- compréhensible ;
- documenté ;
- améliorable ;
- revendable si une opportunité sérieuse se présente.

La priorité n’est pas seulement de créer un site, mais de construire un actif numérique clair, propre et exploitable.
