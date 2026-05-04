# RailReporters — Plan de migration V1.2 vers V2 communautaire

## 1. Objectif du plan

Ce document explique comment passer progressivement de la V1.2 actuelle de RailReporters à une vraie plateforme communautaire.

La V1.2 est une version stable de démonstration :
- site en ligne ;
- design validé ;
- création de reports ;
- photos compressées ;
- commentaires ;
- recherche ;
- domaine officiel ;
- GitHub + Vercel opérationnels.

Mais la V1.2 a une limite importante :
les reports sont stockés dans le navigateur de chaque utilisateur avec `localStorage`.

La V2 doit permettre :
- comptes utilisateurs ;
- reports visibles par tous ;
- commentaires partagés ;
- photos stockées côté serveur ;
- modération ;
- rôles administrateur / modérateur / membre ;
- code plus propre et plus transférable.

---

## 2. Principe de migration

La migration doit se faire progressivement.

La V1.2 doit rester en ligne et stable pendant qu’on prépare la V2.

Objectif :
- ne pas casser railreporters.com ;
- ne pas perdre la version actuelle ;
- avancer étape par étape ;
- tester chaque évolution avant de la mettre en ligne ;
- garder GitHub comme historique du projet.

---

## 3. Ce qu’on garde de la V1.2

On conserve :

- le nom RailReporters ;
- le domaine railreporters.com ;
- la redirection railreporters.fr vers railreporters.com ;
- le principe de report complet ;
- les sections du voyage ;
- la photo d’accueil ;
- les photos par étape ;
- la carte visuelle du trajet ;
- les horaires départ / arrivée ;
- les commentaires ;
- la recherche ;
- le formulaire masqué puis affiché au clic ;
- la compression des photos ;
- le style général coloré ;
- GitHub ;
- Vercel.

---

## 4. Ce qui doit changer en V2

La V2 ne doit plus utiliser `localStorage` comme stockage principal.

À remplacer :

- reports locaux → reports en base de données ;
- commentaires locaux → commentaires en base de données ;
- photos en base64 dans le navigateur → photos dans un stockage serveur ;
- absence de comptes → authentification utilisateur ;
- absence de rôles → rôles membre / modérateur / administrateur ;
- absence de modération → système de signalement et actions admin.

---

## 5. Architecture cible envisagée

### Frontend

Le site pourra évoluer vers une application plus structurée.

Options possibles :
- conserver HTML / CSS / JS au début ;
- ou migrer vers Next.js plus tard.

### Hébergement

Vercel reste l’hébergeur principal.

Vercel est déjà connecté à GitHub et peut redéployer automatiquement après les commits du dépôt.  
Il faut conserver ce fonctionnement.

### Base de données

Supabase est envisagé pour :
- base PostgreSQL ;
- authentification ;
- stockage des photos ;
- règles de sécurité ;
- gestion des utilisateurs.

### Stockage photo

Supabase Storage est envisagé pour :
- photos de reports ;
- photos de profil ;
- suppression par auteur ou administrateur ;
- règles d’accès.

---

## 6. Phases de migration recommandées

## Phase 0 — Stabiliser la V1.2

Statut : déjà fait.

Objectif :
- version stable en ligne ;
- documentation GitHub ;
- domaine principal fonctionnel ;
- backup local ;
- V1.2 notée dans VERSION.txt.

Fichiers déjà créés :
- README.md
- VERSION.txt
- CAHIER_DES_CHARGES_V2.md
- SCHEMA_DATABASE_V2.md

---

## Phase 1 — Préparer Supabase sans toucher au site

Objectif :
- créer un projet Supabase ;
- ne pas encore brancher le site dessus ;
- préparer la structure de base de données ;
- comprendre les tables ;
- préparer les règles de sécurité.

Actions :
1. créer le projet Supabase ;
2. définir les tables principales ;
3. créer les buckets photos ;
4. préparer les règles RLS ;
5. documenter les clés publiques nécessaires ;
6. ne pas encore modifier railreporters.com.

Livrable attendu :
- Supabase prêt en environnement de test.

---

## Phase 2 — Créer l’authentification

Objectif :
permettre aux utilisateurs de créer un compte et se connecter.

Fonctionnalités :
- inscription email ;
- connexion email ;
- déconnexion ;
- profil utilisateur ;
- rôle par défaut : membre.

À prévoir :
- table profiles ;
- lien entre profiles et auth.users ;
- affichage du pseudo utilisateur ;
- bouton “Se connecter” réactivé ;
- bouton “Publier un report” réservé aux membres connectés.

---

## Phase 3 — Migrer les reports vers la base de données

Objectif :
les reports doivent être visibles par tous les visiteurs.

Actions :
1. créer la table reports ;
2. créer la table report_sections ;
3. remplacer l’écriture localStorage par une écriture Supabase ;
4. remplacer la lecture localStorage par une lecture Supabase ;
5. garder l’affichage actuel des cartes ;
6. garder l’affichage actuel du report ouvert ;
7. tester avec un report réel.

Important :
pendant cette phase, il faut garder la V1.2 stable en backup.

---

## Phase 4 — Migrer les photos vers le stockage serveur

Objectif :
ne plus stocker les photos dans le navigateur.

Actions :
1. créer le bucket report-photos ;
2. compresser la photo côté navigateur ;
3. envoyer la photo vers Supabase Storage ;
4. récupérer l’URL publique ou contrôlée ;
5. stocker l’URL en base de données ;
6. afficher les photos depuis leur URL.

Règles :
- taille maximale par photo ;
- formats acceptés ;
- suppression possible par auteur ;
- suppression possible par administrateur.

---

## Phase 5 — Migrer les commentaires

Objectif :
les commentaires doivent être partagés entre tous les visiteurs.

Actions :
1. créer la table comments ;
2. lier chaque commentaire à un report ;
3. lier chaque commentaire à un utilisateur ;
4. afficher les commentaires depuis Supabase ;
5. permettre aux membres connectés de commenter ;
6. permettre à l’administrateur de masquer ou supprimer.

---

## Phase 6 — Ajouter la modération

Objectif :
permettre à l’administrateur de protéger le site.

Fonctionnalités :
- masquer un report ;
- masquer un commentaire ;
- supprimer une photo inadaptée ;
- bloquer un utilisateur ;
- signaler un contenu ;
- consulter les signalements.

Tables concernées :
- moderation_reports ;
- user_bans ;
- profiles ;
- reports ;
- comments ;
- report_photos.

---

## Phase 7 — Nettoyer et structurer le code

Objectif :
rendre le code plus lisible, maintenable et transférable.

Actions :
1. séparer les responsabilités ;
2. éviter les longs fichiers uniques ;
3. ranger le code JavaScript ;
4. organiser le CSS ;
5. documenter le fonctionnement ;
6. préparer éventuellement une migration vers Next.js.

Cette phase est importante pour la revente future.

---

## Phase 8 — Améliorer le SEO

Objectif :
permettre aux reports d’être trouvés sur Google.

Actions :
- URLs propres ;
- titres uniques ;
- descriptions ;
- pages dédiées par report ;
- données de trajet ;
- opérateur ;
- gare de départ ;
- gare d’arrivée ;
- optimisation des images.

Exemples :
- /reports/tgv-paris-lyon-premiere-classe
- /reports/eurostar-paris-londres
- /reports/ice-berlin-munich

---

## Phase 9 — Préparer la monétisation

Objectif :
prévoir des revenus futurs sans nuire à l’expérience utilisateur.

À ne pas faire trop tôt.

Possibilités :
- publicité discrète ;
- partenariats ;
- affiliation billets de train ;
- contenus sponsorisés ;
- newsletter ;
- pages opérateurs.

Règle :
la monétisation ne doit jamais rendre la lecture désagréable.

---

## 7. Ordre de priorité recommandé

### Priorité immédiate

1. conserver la V1.2 stable ;
2. préparer Supabase ;
3. créer l’authentification ;
4. créer les reports en base de données ;
5. stocker les photos côté serveur.

### Priorité secondaire

6. commentaires partagés ;
7. profils utilisateurs ;
8. modération simple.

### Priorité plus tardive

9. SEO avancé ;
10. design V2 ;
11. monétisation ;
12. traduction anglaise.

---

## 8. Risques à éviter

### Risque 1 — casser la V1.2

Solution :
ne pas modifier directement le site stable sans backup.

### Risque 2 — créer trop de fonctionnalités en même temps

Solution :
une fonctionnalité à la fois.

### Risque 3 — stocker des photos trop lourdes

Solution :
compression automatique avant envoi.

### Risque 4 — sécurité insuffisante

Solution :
mettre en place des règles RLS dès le départ.

### Risque 5 — absence de modération

Solution :
prévoir les rôles admin / modérateur dès la conception.

### Risque 6 — code difficile à reprendre

Solution :
documenter et nettoyer le code avant d’aller trop loin.

---

## 9. Méthode de travail recommandée

Pour chaque évolution :

1. faire un backup local ;
2. modifier en local ;
3. tester en local ;
4. envoyer sur GitHub ;
5. attendre Vercel ;
6. tester en ligne ;
7. mettre à jour VERSION.txt si l’évolution est validée.

---

## 10. Ce qu’on ne doit pas faire maintenant

À éviter pour l’instant :

- ajouter de la publicité ;
- créer un système de paiement ;
- lancer une application mobile ;
- traduire tout le site ;
- ajouter des badges complexes ;
- ajouter trop d’animations ;
- refaire tout le design ;
- supprimer la V1.2.

---

## 11. Objectif final de la V2

La V2 doit transformer RailReporters en vraie plateforme communautaire.

Objectifs finaux :

- un visiteur peut lire les reports ;
- un membre peut créer un compte ;
- un membre peut publier un report ;
- les reports sont visibles par tous ;
- les photos sont stockées correctement ;
- les commentaires sont partagés ;
- l’administrateur peut modérer ;
- le projet reste propre et transférable ;
- le site peut évoluer vers une vraie communauté ;
- le site reste revendable si une opportunité se présente.

---

## 12. Résumé stratégique

La V1.2 est une vitrine fonctionnelle.

La V2 sera la vraie plateforme.

La bonne stratégie est :

1. ne pas casser la vitrine actuelle ;
2. préparer la base communautaire ;
3. migrer progressivement les données ;
4. sécuriser les utilisateurs et la modération ;
5. améliorer ensuite le SEO et la monétisation.

RailReporters doit rester un actif numérique clair, documenté, transférable et crédible.
