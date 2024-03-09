const mongoose = require('mongoose');

const dbUrl = 'mongodb://localhost:27017/CSB'
const connection = mongoose.connect(dbUrl,
// const connection = mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dcst7ml.mongodb.net/?retryWrites=true&w=majority`,
    { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => {
    console.log('Connexion à MongoDB réussie !')})
  .catch(() => console.log('Connexion à MongoDB échouée !'));

exports.databaseConnection = connection;