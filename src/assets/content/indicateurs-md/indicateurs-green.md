# Indicateurs GreenIt

Source des données : VMware via le logiciel VROPS

## Consomation Maxi (sur 5 min)

Énergie consommée maximum sur une période de 5 min en wattheure. Si on veut calculer une puissance maximale instantanée la formule est P=E/t , où E est l'énergie consommée (watt-heures), P la puissance en Watt et t la durée en heures. Si on consomme 5 Wh en 5 min, alors ça veut dire que la puissance instantanée était de 5/(5/60) = 5\*60/5 = 60 W unité= Wh (Watt-heure)

## CPU alloué (Provisionné)

quantité de CPU virtuelle allouée à la VM correspondant au maximum qu’elle peut utiliser. Cette valeur peut changer après la création d’une VM mais c’est plutôt rare. La valeur est observée au moment de la création du fichier soit le 1er mois. unité= Mhz (Méga Hertz)

## RAM Allouée (Provisionné)

quantité de mémoire vive allouée à la VM correspondant au maximum qu’elle peut utiliser. Cette valeur peut changer après la création d’une VM mais c’est plutôt rare. La valeur est observée au moment de la création du fichier soit le 1er mois. unité= Go (Giga octets)

## Disque alloué (Provisionné)

quantité de disque alloué (l’espace est physiquement réservé) à la VM correspondant au maximum qu’elle peut utiliser. Cette valeur peut changer après la création d’une VM mais c’est plutôt rare. La valeur est observée au moment de la création du fichier soit le 1er mois. unité= Go (Giga octets)

## Nombre de VM

nombre de machines virtuelles consommées par l'application, toutes platefomres confondues, incluant les bases de données ou logiciels faisant l'object d'une architecture dédiée à l'application.
