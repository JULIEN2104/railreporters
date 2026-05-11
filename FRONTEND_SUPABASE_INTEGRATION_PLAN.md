# RailReporters — Frontend Supabase Integration Plan

## Objectif

Ce document prépare la future connexion entre le site RailReporters et Supabase.

La V1.2 actuelle reste stable et indépendante de Supabase.

Objectif de la future intégration :

- connecter le site à Supabase ;
- permettre l’inscription et la connexion ;
- publier les reports en base de données ;
- uploader les photos dans Supabase Storage ;
- lire les reports partagés depuis Supabase ;
- lire les commentaires partagés depuis Supabase ;
- préserver la sécurité des clés ;
- éviter de casser railreporters.com.

---

## 1. Règle principale

Ne pas connecter directement le site public sans test local.

Ordre obligatoire :

1. préparer le plan ;
2. tester en local ;
3. vérifier Supabase ;
4. vérifier les règles RLS ;
5. vérifier les uploads Storage ;
6. mettre à jour GitHub ;
7. attendre Vercel ;
8. tester en ligne.

---

## 2. État actuel

La V1.2 utilise encore :

- HTML ;
- CSS ;
- JavaScript ;
- localStorage ;
- Vercel ;
- GitHub ;
- domaine railreporters.com.

Supabase est préparé en arrière-plan :

- tables créées ;
- utilisateur test créé ;
- profil admin créé ;
- report test créé ;
- section test créée ;
- commentaire test créé ;
- bucket report-photos créé ;
- upload manuel validé ;
- URL publique validée.

Le site public n’est pas encore connecté à Supabase.

---

## 3. Clés Supabase

Supabase fournit plusieurs types de clés.

### Clé publique / anon / publishable

Cette clé peut être utilisée côté navigateur si :

- RLS est activé ;
- les policies sont correctes ;
- les données privées sont protégées ;
- les opérations sensibles ne sont pas autorisées sans contrôle.

Elle servira à initialiser le client Supabase côté frontend.

### Clé service_role / secret key

Cette clé ne doit jamais être utilisée :

- dans index.html ;
- dans script.js ;
- dans GitHub ;
- dans le navigateur ;
- dans du code public ;
- dans une page visible par les utilisateurs.

Cette clé peut contourner les règles RLS. Elle doit rester côté serveur uniquement.

---

## 4. Situation particulière de RailReporters

RailReporters V1.2 est actuellement un site statique simple.

Il n’y a pas encore :

- framework ;
- build ;
- backend ;
- serveur privé ;
- fonctions server-side.

Conséquence :

- la clé publique Supabase pourra être utilisée côté navigateur ;
- la clé service_role ne devra jamais être utilisée ;
- les actions sensibles devront être protégées par RLS ;
- si on a besoin d’actions admin complexes, il faudra plus tard utiliser une fonction serveur ou une Edge Function.

---

## 5. Variables d’environnement

Vercel permet de gérer des variables d’environnement dans les réglages d’un projet.

Mais avec un site HTML/CSS/JS statique sans build, ces variables ne sont pas automatiquement injectées dans le navigateur.

Deux options possibles :

### Option A — V2 simple

Utiliser dans le frontend :

- URL publique Supabase ;
- clé anon / publishable.

Cette option est acceptable si RLS est bien configuré.

### Option B — V2 plus structurée

Migrer plus tard vers un framework comme Next.js.

Avantages :

- meilleure gestion des variables ;
- séparation frontend / backend ;
- routes serveur ;
- actions admin plus propres ;
- meilleure sécurité pour certaines opérations.

Décision initiale :

Commencer prudemment avec la clé publique seulement, sans clé secrète.

---

## 6. Ce qu’il ne faut jamais mettre dans GitHub

Ne jamais mettre :

- service_role key ;
- secret key ;
- mot de passe ;
- token privé ;
- clé admin ;
- accès email sensible ;
- fichier contenant des secrets.

GitHub peut détecter certains secrets avec ses protections, mais il ne faut pas compter uniquement dessus.

---

## 7. Première étape technique côté frontend

Créer une version locale de test qui ajoute le client Supabase.

Exemple conceptuel :

```javascript
const SUPABASE_URL = "url_publique_du_projet";
const SUPABASE_ANON_KEY = "cle_publique_anon_ou_publishable";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
