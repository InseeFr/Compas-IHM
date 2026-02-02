# Indicateurs DevOps

## Dernière mise en production

Il s'agit d'un indicateur qui relate le nombre de jours écoulés depuis la dernière mise en production du module applicatif c'est à dire la dernière fois où un livrable a été déployé sur la ressource (de production) l'hébergeant (une VM ou Kube).\
Le calcul se fait à la date du jour.\
La source de l'information est Oscar qui récupère l'information sur les livraisons en scannant régulièrement les repo Puppet Gitlab ou en interrogeant l'API Kube.

L'unité est le jour et l'agrégation au niveau application s'effectue par une moyenne simple sur l'ensemble des modules de l'application.

Les catégories de regroupement sont les suivantes :

| A         | B                 | C                 | D                     | E            |
| --------- | ----------------- | ----------------- | --------------------- | ------------ |
| \< 1 mois | entre 1 et 3 mois | entre 3 et 6 mois | entre 6 mois et un an | plus d'un an |

## Nombre de mises en production (MEP)

Il s'agit tout simplement du nombre de déploiements en production effectués pour chque module applicatif sur la durée des 30 jours précédent la date du jour.
La source de l'information est Oscar qui récupère l'information sur les livraisons en production en scannant régulièrement les repo Puppet Gitlab ou en interrogeant l'API Kube.

L'unité est le nombre issu du comptage et l'agrégation au niveau application s'effectue par une moyenne simple sur l'ensemble des modules de l'application.

Les catégories de regroupement sont les suivantes :

| A         | B     | C     | D     | E          |
| --------- | ----- | ----- | ----- | ---------- |
| \>= 4 MEP | 3 MEP | 2 MEP | 1 MEP | aucune MEP |

## Nombre de contributeurs

Il s'agit du nombre de personnes différentes qui a commité (au sens Git) du code pour le module applicatif sur les trente derniers jours (à partir de la date du jour). L'URL utilisée pour le code source et celle du projet Gitlab référencé dans Oscar qui est soit sur gitlab.insee.fr soit sur github.

L'unité est le nombre de personnes différentes et l'agrégation au niveau application s'effectue par une moyenne simple sur l'ensemble des modules de l'application en ne comptant qu'un seule fois les modules qui ont le m^me URL de code source (ils sont indiqués par un d comme doublon dans l'IHM).

Les catégories de regroupement sont les suivantes :

| A                  | B              | C              | D              | E                                  |
| ------------------ | -------------- | -------------- | -------------- | ---------------------------------- |
| \>= 4 conributeurs | 3 conributeurs | 2 conributeurs | 1 conributeurs | aucune contribution sur la période |
