# RailReporters — Auth Site Local V2

## Objectif

Ce document garde une trace de l’intégration locale de l’authentification Supabase dans le site RailReporters.

La V1.2 publique sur railreporters.com n’est pas encore modifiée.

---

## 1. État actuel

L’authentification Supabase a été intégrée localement dans le site principal de test.

Fichiers locaux concernés :

- index.html
- script.js

Une sauvegarde locale a été créée avant modification.

Backup :

- railreporters_backup_avant_auth_site_principal

---

## 2. Ce qui fonctionne localement

Tests validés :

- le site local s’ouvre correctement ;
- le bouton Se connecter / Mon compte fonctionne ;
- la session Supabase est détectée automatiquement ;
- le profil utilisateur est récupéré depuis la table profiles ;
- le pseudo est affiché ;
- le rôle admin est affiché ;
- la déconnexion fonctionne ;
- après déconnexion, le bouton redevient Se connecter ;
- le bouton Publier un report fonctionne toujours ;
- la publication locale continue de fonctionner.

Statut : validé.

---

## 3. Protection de la publication

Une protection locale a été ajoutée sur le bouton Publier un report.

Comportement validé :

- utilisateur non connecté : le formulaire ne s’ouvre pas directement ;
- utilisateur non connecté : la fenêtre de connexion s’ouvre ;
- utilisateur connecté : le formulaire de publication s’ouvre normalement.

Cela prépare la future logique V2 :

- seuls les membres connectés pourront publier ;
- les visiteurs pourront lire les reports ;
- les reports resteront plus tard liés à un profil utilisateur.

Statut : validé.

---

## 4. Ce que cela valide

L’intégration locale confirme que RailReporters peut :

- initialiser le client Supabase ;
- reconnaître un utilisateur connecté ;
- récupérer son profil depuis profiles ;
- distinguer un membre d’un admin ;
- afficher un état connecté / non connecté ;
- protéger l’accès à la publication ;
- conserver le fonctionnement actuel du formulaire de publication local.

---

## 5. Ce qui n’est pas encore fait

Non encore réalisé :

- publication de cette version sur GitHub ;
- mise en ligne sur railreporters.com ;
- inscription depuis le site public ;
- publication des reports dans Supabase ;
- lecture des reports depuis Supabase ;
- upload de photos depuis le site vers Supabase Storage ;
- commentaires partagés depuis Supabase ;
- interface admin réelle ;
- modération réelle.

---

## 6. Sécurité

Aucune clé secrète ne doit être utilisée dans le site.

À ne jamais mettre dans le navigateur ou GitHub :

- service_role key ;
- secret key ;
- clé commençant par sb_secret_;
- mot de passe ;
- token privé.

Seule la clé publishable peut être utilisée côté navigateur si les règles RLS sont correctement configurées.

---

## 7. Décision actuelle

L’authentification Supabase est validée en local.

La protection locale de la publication est validée.

La version publique V1.2 reste stable.

La prochaine étape doit être décidée prudemment :

- soit garder l’auth locale en test encore un moment ;
- soit préparer une mise en ligne contrôlée ;
- soit commencer la migration progressive des reports vers Supabase.

Recommandation actuelle :

Ne pas publier immédiatement sans décision claire sur la suite.
