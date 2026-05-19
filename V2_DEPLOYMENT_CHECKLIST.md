# RailReporters — Checklist mise en ligne V2 contrôlée

## Objectif

Ce document prépare la future mise en ligne contrôlée de RailReporters V2.

La version publique V1.2 sur `railreporters.com` reste stable tant que cette checklist n’est pas validée.

---

## 1. État actuel

La V2 Supabase est validée localement sur les briques principales :

- Auth Supabase ;
- profil utilisateur ;
- rôle admin ;
- protection de la publication si non connecté ;
- création d’un report Supabase ;
- création des sections Supabase ;
- upload photo Supabase Storage ;
- création d’une ligne `report_photos`;
- création d’un commentaire Supabase ;
- lecture d’un report complet depuis Supabase ;
- affichage auteur du report ;
- affichage auteur du commentaire.

Statut : validé localement.

---

## 2. Ce qui ne doit pas encore être publié sans contrôle

Ne pas publier immédiatement :

- zones de test visibles ;
- fichiers HTML de test Supabase ;
- fichiers contenant des valeurs Supabase collées manuellement ;
- version non nettoyée du formulaire ;
- version avec messages techniques visibles ;
- version avec données de test non assumées.

---

## 3. Sécurité des clés

Avant mise en ligne, vérifier :

- aucune clé `sb_secret_...`;
- aucune clé `service_role`;
- aucun mot de passe ;
- aucun token privé ;
- uniquement la clé publishable côté navigateur.

La clé publishable peut être utilisée côté navigateur si RLS est correctement configuré.

---

## 4. RLS tables

Vérifier que RLS est actif sur :

- `profiles`;
- `reports`;
- `report_sections`;
- `report_photos`;
- `comments`;
- `moderation_reports`;
- `user_bans`.

Objectifs :

- un visiteur peut lire les reports publiés ;
- un utilisateur connecté peut créer ses propres reports ;
- un utilisateur connecté peut créer ses propres sections ;
- un utilisateur connecté peut commenter ;
- un utilisateur ne peut pas modifier le contenu d’un autre ;
- un utilisateur banni ne peut pas publier ;
- un admin peut modérer.

---

## 5. Storage policies

Vérifier le bucket :

```text
report-photos
