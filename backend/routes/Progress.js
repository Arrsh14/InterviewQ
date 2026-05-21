// routes/progress.js
router.get('/:userId', async (req, res) => {
    try {
      const sessions = await InterviewSession.find({ userId: req.params.userId })
        .sort({ createdAt: 1 });
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });