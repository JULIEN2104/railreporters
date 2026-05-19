# RailReporters — Plan intégration du vrai formulaire Supabase V2

## Objectif

Ce document prépare l’intégration progressive du vrai formulaire RailReporters avec Supabase.

La version publique V1.2 sur `railreporters.com` reste inchangée.

Jusqu’à maintenant, les tests Supabase ont été réalisés dans des zones séparées du site local :

- lecture Supabase ;
- publication Supabase sans photo ;
- publication Supabase avec sections ;
- publication Supabase avec photo ;
- commentaire Supabase.

La prochaine étape est de préparer la migration du vrai formulaire RailReporters.

---

## 1. Situation actuelle

Aujourd’hui, le vrai formulaire RailReporters fonctionne encore avec :

```text
localStorage
