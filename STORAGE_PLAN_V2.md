# RailReporters — Plan Storage V2

## Objectif

Ce document prépare la gestion des photos dans la V2 communautaire de RailReporters.

La V1.2 stocke encore les images localement dans le navigateur via localStorage.  
La V2 devra stocker les photos côté serveur, probablement avec Supabase Storage.

---

## 1. Pourquoi utiliser Supabase Storage

Supabase Storage servira à stocker :

- les photos d’accueil des reports ;
- les photos des sections de voyage ;
- les avatars des utilisateurs ;
- éventuellement d’autres médias plus tard.

Objectif :

- éviter de stocker les images dans le navigateur ;
- rendre les photos visibles par tous ;
- réduire les limites de localStorage ;
- permettre la suppression/modération des photos ;
- préparer une vraie plateforme communautaire.

---

## 2. Buckets prévus

### Bucket principal

Nom :

`report-photos`

Utilisation :

- photos d’accueil des reports ;
- photos des étapes du voyage ;
- photos liées aux sections.

### Bucket secondaire

Nom :

`profile-avatars`

Utilisation :

- photos de profil des utilisateurs.

---

## 3. Stratégie recommandée

Pour commencer, créer seulement :

`report-photos`

Ne pas créer tous les buckets trop tôt.

La V2 doit avancer progressivement :

1. tester un bucket ;
2. tester un upload manuel ;
3. tester une URL de photo ;
4. seulement ensuite connecter le formulaire du site.

---

## 4. Public ou privé ?

Question importante.

### Option 1 — bucket public

Avantages :

- plus simple ;
- les photos des reports publiés sont faciles à afficher ;
- bon pour un premier prototype V2.

Inconvénients :

- les fichiers sont accessibles si quelqu’un connaît l’URL ;
- moins fin pour la modération.

### Option 2 — bucket privé

Avantages :

- meilleur contrôle ;
- accès protégé par règles ;
- plus adapté à une plateforme mature.

Inconvénients :

- plus complexe ;
- nécessite des signed URLs ou règles adaptées ;
- plus difficile pour commencer.

### Décision recommandée pour le début

Commencer avec un bucket `report-photos` public pour les photos de reports publiés.

Pourquoi :

- les reports publiés sont destinés à être visibles ;
- c’est plus simple pour une première V2 ;
- on peut quand même contrôler l’upload et la suppression via des règles ;
- on pourra rendre certaines parties privées plus tard si besoin.

---

## 5. Règles d’accès envisagées

Pour `report-photos` :

### Lecture

- les visiteurs peuvent voir les photos des reports publiés ;
- les photos de reports masqués ou supprimés ne devront plus être affichées par le site.

### Upload

- seuls les utilisateurs connectés peuvent uploader ;
- l’utilisateur doit être l’auteur du report ;
- un utilisateur banni ne peut pas uploader.

### Suppression

- l’auteur peut supprimer ses propres photos ;
- l’administrateur peut supprimer toute photo inadaptée ;
- le modérateur peut supprimer ou masquer selon les droits prévus.

---

## 6. Organisation des fichiers

Structure recommandée :

```text
report-photos/
  user-id/
    report-id/
      cover.jpg
      section-id-1-photo-1.jpg
      section-id-1-photo-2.jpg
      section-id-2-photo-1.jpg
