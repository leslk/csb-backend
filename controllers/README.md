# Introduction

Ce projet est une API construite avec Node.js et Express, utilisant MongoDB comme base de données. L'API permet de gérer les fonctionnalités d'un site web pour l'association CAEN STREET BALL, incluant la gestion des tournois, des comptes admin, du contenu du site utilisateur et des demandes de contact.

# Prérequis
- Node.js (version 14 ou supérieure)
- MongoDB (installé et tournant en local)
- npm (Node Package Manager)
## Installation
1. Clonez le dépôt :

```
git clone git@github.com:leslk/csb-backend.git
```

2. Installez les dépendances :

```
npm install
````
3. Configuration de l'environnement :

- Créez un fichier .env à la racine du projet et copier y les variables d'environnement fourni :

4. Lancez MongoDB en local :

- Assurez-vous que MongoDB est installé et lancé sur votre machine. Vous pouvez utiliser la commande suivante pour démarrer MongoDB :

```
mongod
````

5. Démarrage du Serveur en mode développement :

```
npm run dev
````

6. Accédez à l'API :

- Ouvrez votre navigateur et accédez à http://localhost:3000.

### Admins
POST /api/admins Création d'un admin<br>
POST /api/admins/login Connexion admin<br> 
GET /api/admins Récupération de tous les comptes admin<br>
PUT /api/admins/:id Modification d'un admin<br>
POST /api/admins/:id/password Création du password d'un admin<br>
PUT /api/admins/:id/password Modification d'un password admin<br>
DELETE /api/admins/:id Suppression d'un admin<br>
GET /api/admins/logout Déconnexion d'un admin<br>
GET /api/admins/checkToken/:id/:token Vérification du token d'un admin<br>
POST /api/admins/forgetPassword Demande de réinitialisation de mot de passe d'un admin<br>
PUT /api/admins/:id/resetPassword Réinitialisation du mot de passe d'un admin<br>
POST /api/admins/:id/sendInvitation Envoi d'une invitation pour la création de compte d'un nouvel admin<br>

### Tournois
POST /api/tournaments Création d'un tournoi<br>
GET /api/tournaments Récupération des tournois<br>
GET /api/tournaments/:id Récupération d'un tournoi<br>
PUT /api/tournaments/:id Modification d'un tournoi<br>
PUT /api/tournaments/:id/tournamentHistory Modification du tournamentHistory d'un tournoi<br>
PUT /api/tournaments/:id/participants Modification de la liste des participants coté admin<br>
PUT /api/tournaments/:id/user-participants Modification de la liste des participants coté user<br>
DELETE/api/tournaments/:id/participants/:participantId Suppression d'un participant<br>

### Contenu du site
GET /api/siteContent Récupertation du contenu du site<br>
PUT /api/siteContent Modification du contenu du site<br>
POST /api/siteContent Création du contenu du site<br>

### Upload
POST /api/upload Enregistrement d'une image<br>
DELETE /api/upload Suppression d'une image<br>
L'API utilise des cookies HTTP-only et des tokens JWT pour l'authentification<br>

### Contact 
POST /api/contact Envoi de mail a Caen street ball et au demandeur de contact via le site utilisateur

7. Déploiement
```
npm run build
````

- Démarrez le serveur en production :

```
npm start
```