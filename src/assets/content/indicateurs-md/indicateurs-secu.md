# Indicateurs Sécurité

## CVE

Il s'agit d'un indicateur qui s'appuie sur le nombre de failles de sécurités (CVE) récupérées depuis l'[outil Analyzer](https://analyzer.insee.fr/).\
Compas récupère le nombre de failles critiques, majeures, moyennes et faibles pour chaque module.

L'agrégation au niveau application s'effectue par simple somme sur ces effectifs.\
Ensuite Compas calcule une fonction f Où f=log10 (1000 \* CVEcritiques + 100 \* CVEmajeures + 10 \* CVEmoyennes + CVEfaibles + 1) puis applique des catégories.

Les catégories sont les suivantes :

| A          | B              | C              | D                  | E     |
| ---------- | -------------- | -------------- | ------------------ | ----- |
| aucune CVE | f dans \]0,1\[ | f dans \[1,2\[ | D : f dans \[2,3\[ | f\>=3 |

## Nombre de VMs hors délai

Il s'agit du nombre machines virtuelles **non redémarrées depuis plus de 30 jours** toutes plateformes confondues (prod et hors prod).

L'information n'est disponible qu'au niveau application et pas au niveau module (indiqué non NR à ce niveau).  
La source des données est [hyperX](https://hyperx.insee.fr/).

Les catégories sont les suivantes :

| A          | B            | C             | D              | E              |
| ---------- | ------------ | ------------- | -------------- | -------------- |
| auncune VM | de 1 à 4 VMs | de 5 à 11 VMs | de 12 à 19 VMs | plus de 20 VMs |

## Max délais Maj VM

On repére pour l'application la VM dont le dernier redémarrage est le plus ancien (toutes plateformes confondues), on affiche le nombre de jours correspondant.  
Cette information est en partie redondante avec celle précédente, notamment quand elle vaut moins de 30 (jours), alors on a A pour le nb de VMs hors délai, c'est pourquoi elle ne participe pas à l'indicateur synthétique de sécurité qui résume seulement CVE et nb de VMs hors délai.

L'information n'est disponible qu'au niveau application et pas au niveau module (indiqué non NR à ce niveau).  
La source des données est [hyperX](https://hyperx.insee.fr/).  
L'unité est le jour.
