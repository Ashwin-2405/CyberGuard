const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Register routes later here
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const auth = require('./middleware/auth');

app.get('/api/protected', auth, (req, res) => {
  res.json({ msg: `Hello, ${req.user.username}! You accessed a protected route.` });
});

