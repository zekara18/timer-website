// server.js
import express from 'express';
import pkg from 'pg';
import cors from 'cors'; // Ajout de l'import CORS

const app = express();
const port = 3001;
const { Pool } = pkg;
// Configuration de la connexion PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'votre_table',
  password: 'Merouane123',
  port: 5432,
});

// Middleware
app.use(express.json());
app.use(cors()); // Activation de CORS pour toutes les routes

// Variable pour stocker l'état du timer
let timerState = {
  timeLeft: 60,
  intervalId: null
};

// Endpoint pour démarrer le timer et obtenir les données initiales
app.get('/api/timer', async (req, res) => {
  try {
    // Réinitialiser le timer
    timerState.timeLeft = 60;
    
    // Récupérer le texte depuis la base de données
    const result = await pool.query('SELECT text FROM votre_table LIMIT 1');
    const dbText = result.rows[0]?.text || 'Texte par défaut';

    // Si un timer existe déjà, le nettoyer
    if (timerState.intervalId) {
      clearInterval(timerState.intervalId);
    }

    // Démarrer un nouveau timer
    timerState.intervalId = setInterval(() => {
      timerState.timeLeft--;
      
      if (timerState.timeLeft <= 0) {
        clearInterval(timerState.intervalId);
        timerState.intervalId = null;
      }
    }, 1000);

    res.json({
      timeLeft: timerState.timeLeft,
      text: timerState.timeLeft > 0 ? '' : dbText,
      isActive: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour obtenir l'état actuel du timer
app.get('/api/timer-status', async (req, res) => {
  try {
    const result = await pool.query('SELECT text FROM votre_table LIMIT 1');
    const dbText = result.rows[0]?.text || 'Texte par défaut';

    res.json({
      timeLeft: timerState.timeLeft,
      text: timerState.timeLeft > 0 ? '' : dbText,
      isActive: timerState.intervalId !== null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});