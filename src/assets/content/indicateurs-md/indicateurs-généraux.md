# Indicateurs généraux

les indicateurs généraux synthétisent en général un domaine et porte le nom du domaine, cela vaut pour Qualité, Sécurité, Devops, GreenIt, Météo ressentie, Accessibilité et Maturité Cloud.

**Météo ressentie** et **maturité Cloud** correspondent à une seule information.

Le domaine **qualité**, par exemple, propose un indicateur synthétique regroupant les trois indicateurs de base de type qualité que sont : Couverture de test, Fiabilité et Dette technique.

Le principe est d'associer à chaque modalité de chaque indicateur de base participant à la synthèse une valeur entière de 0 à 4 puis de calculer une sorte de distance et enfin de reconstruire des modalités A à E à partir du résultat selon les catégories suivantes :

| A           | B             | C             | D             | E           |
| ----------- | ------------- | ------------- | ------------- | ----------- |
| \[3.5 à 4\] | \[2.5 à 3.5\[ | \[1.5 à 2.5\[ | \[0.5 à 1.5\[ | \[0 à 0.5\] |

Pour la partie **Green**, il est également proposé un indicateur synthétique construit différement (et en partie exploratoire) sous forme d'un score basé sur 3 composantes :

- un score pour la consommation électrique (ratio entre la somme des consommations des vm d'une application et la consommation maxi de l'application la plus "énergivore")
- un score pour mesurer l'impact sur l'infrastructure (à partir de la RAM, la CPu et le disque alloués, idem un ratio avec l'impact maxi de notre portefeuille d'applications)
- un score pour mesurer le gaspillage disque (combo entre le % de disque utilisé et l'espace non consommé)

Le score final aujourd'hui propose la répartition suivante :

- 40% pour la consommation électrique
- 40% pour l'impact sur l'infrastructure
- 20% sur le gaspillage.  
  sachant que les poids de chacun de ces scores sont facilement ajustables.

Le score final est ensuite résumé au travers des classes suivantes :  
| A | B | C | D | E |
|---|---|---|---|---|
| \[0 à 0.2\[ | \[0.2 à 0.4\[ | \[0.4 à 0.6\[ | \[0.6 à 0.8\[ | \[>= 0.8\] |
