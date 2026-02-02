# Indicateurs Qualité

## Couverture de test

Il s'agit du taux de couverture du code source d'un **module** par des tests unitaires. La source de la donnée est [SonarQube](https://sonar.insee.fr), [ici par exemple](https://sonar.insee.fr/component_measures?metric=line_coverage&id=fr.insee%3Acompas).\
Ce taux consiste précisément en le rapport du nombre de lignes testées sur le nombre de lignes totales d'un module applicatif.

L'agrégation au niveau application s'effectue selon la formule suivante (somme sur tous les modules) : (Σnb_lignes_testées/Σnb_lignes_totales)\*100

Les catégories sont les suivantes :

| A                | B               | C               | D               | E          | X   |
| ---------------- | --------------- | --------------- | --------------- | ---------- | --- |
| \]80 % à 100 %\] | \]60 % à 80 %\[ | \]40 % à 60 %\[ | \]20 % à 40 %\[ | \]0 à 20\] | 0 % |

## Fiabilité

Il reflète les comportements non désirés dans un module applicatif, en d'autres termes, les bugs. La source de la donnée est [SonarQube](https://sonar.insee.fr).\
C'est ce qui est appelé **Reliability** dans Sonar et la valeur récupérée est celle indiquée dans [Overall Code/ Rating](https://sonar.insee.fr/component_measures?metric=reliability_rating&id=fr.insee%3Acompas). L'indicateur se présente directement sous forme de catégories se basant sur des issus avec une échelle de criticité :\
informatives \< mineures \< majeure \< critique \< bloquante.

L'agrégation au niveau application s'effectue en ne retenant que la lettre qui correspond au plus haut niveau de criticité des modules la composant.

Les catégories sont les suivantes :

| A                                  | B                           | C                           | D                            | E                             |
| ---------------------------------- | --------------------------- | --------------------------- | ---------------------------- | ----------------------------- |
| uniquement des issues informatives | des issues mineures (et \<) | des issues majeures (et \<) | des issues critiques (et \<) | des issues bloquantes (et \<) |

## Dette technique

Il s'agit d'une estimation de la charge de _refactoring_ du code d'un **module** pour être en phase avec des bonnes pratiques de développement. La source de la donnée est [SonarQube](https://sonar.insee.fr), l'unité est la minute (de travail).

L'agrégation au niveau application s'effectue selon une simple somme sur tous les modules de l'application.

Les catégories sont les suivantes :

| A                   | B                     | C              | D             | E              |
| ------------------- | --------------------- | -------------- | ------------- | -------------- |
| moins d'une semaine | une semaine à un mois | de un à 3 mois | de 3 à 6 mois | plus de 6 mois |
