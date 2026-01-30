# Indicateur Maturité Cloud

**Maturité Cloud** résulte d'une analyse statistique des données de l'enquête menée auprès des SNDI qui a permis de classer les applications en 4 catégories :

- Maturité cloud très forte
- Maturité cloud assez forte
- Maturité cloud moyenne
- Maturité cloud faible

# A quoi correspondent NR et SO ?

Deux modalités particulières sont susceptibles d'apparaitre :\

**SO**, pour **sans objet**, vaut quand l'indicateur en question n'a pas de sens dans ce cas particulier.\
Exemples : la dernière livraison en production vaut SO pour un module pas encore en production ou le résultat d'un audit d’accessibilité vaut SO pour un module de type batch.

**NR**, pour **Non réponse**, vaut quand il n'a pas été possible de récupérer l'information. Les raisons peuvent être multiples : non saisie, information manquante dans Oscar (typiquement l'URL du code source) ou une impossibilité technique liée à la source.\
Exemples : NR dans les CVE pour un module sans URL du code source dans Oscar, NR dans la couverture de test pour un module sans Id Sonar présent dans Oscar

**et quand on les agrège au niveau application ?**

Quand on agrège un indicateur au niveau application, les règles sont les suivantes : on ignore les SO et NR des modules de l'application dès lors qu'au moins une vraie valeur est présente sinon le NR prime sur le SO.\
ainsi :

- (NR,SO,A) donne A
- (NR,NR) donne NR
- (SO,SO) donne SO
- (NR,SO) donne NR
