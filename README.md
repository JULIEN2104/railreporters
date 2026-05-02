# RailReporters

RailReporters est un prototype de plateforme communautaire dédiée aux reports de voyages en train.

L’objectif du projet est de créer un équivalent ferroviaire du concept “flight report” : permettre aux voyageurs de partager leurs expériences détaillées de trajet en train avec photos, itinéraire, services à bord, confort, avis et commentaires.

## Site en ligne

Domaine principal :

https://railreporters.com

Redirection :

https://railreporters.fr → https://railreporters.com

## Fonctionnalités actuelles

- Page d’accueil avec image locale
- Liste des derniers reports
- Création d’un report de voyage
- Ajout de photos
- Compression automatique des photos avant sauvegarde
- Recherche en direct
- Ouverture et fermeture des reports
- Carte visuelle du trajet avec animation
- Commentaires
- Suppression de reports avec confirmation
- Bouton retour en haut
- Formulaire de publication masqué par défaut
- Compatibilité ordinateur et tablette testée

## Limites actuelles du prototype

Cette version utilise le stockage local du navigateur (`localStorage`).

Cela signifie que :

- les reports créés par un utilisateur restent dans son navigateur ;
- les reports ne sont pas encore partagés entre tous les visiteurs ;
- il n’y a pas encore de comptes utilisateurs ;
- il n’y a pas encore de base de données centrale ;
- la modération n’est pas encore intégrée.

## Évolutions prévues

- Création de comptes utilisateurs
- Connexion / inscription
- Base de données partagée
- Stockage des photos côté serveur
- Système de modération
- Signalement des contenus inadaptés
- Rôles administrateur / modérateur
- Amélioration du design
- Nettoyage et structuration du code
- Éventuelle monétisation future

## Version actuelle

Prototype stable en ligne V1.

Voir aussi le fichier `VERSION.txt`.
