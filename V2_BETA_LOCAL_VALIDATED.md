# RailReporters — V2 beta locale validée

## Objectif

Ce document confirme que la V2 beta de RailReporters fonctionne en local.

La version publique V1.2 sur `railreporters.com` reste inchangée tant qu’aucune mise en ligne contrôlée n’est décidée.

---

## 1. Statut général

La V2 beta locale est validée.

Le site local peut maintenant fonctionner avec Supabase pour les principales briques communautaires :

- authentification ;
- profil utilisateur ;
- rôle admin ;
- publication protégée ;
- création de reports ;
- création de sections ;
- upload photo Storage ;
- enregistrement photo dans `report_photos`;
- commentaires Supabase ;
- affichage des auteurs.

Statut : validé localement.

---

## 2. Authentification

Fonctions validées :

- connexion Supabase ;
- déconnexion ;
- session automatique ;
- affichage du pseudo ;
- affichage du rôle ;
- bouton `Se connecter`;
- bouton `Mon compte`.

Exemple validé :

```text
julien5104 · admin
