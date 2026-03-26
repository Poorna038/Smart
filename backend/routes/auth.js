router.post("/signup", (req, res) => {
  res.json({ message: "User created" });
});

router.post("/login", (req, res) => {
  res.json({ token: "sample_token" });
});