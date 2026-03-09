import express from 'express';

const router = express.Router();

router.post('/login', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email requerido' });
  }

  const token = Buffer.from(email).toString('base64');
  
  res.json({
    token,
    user: { email }
  });
});

export default router;
