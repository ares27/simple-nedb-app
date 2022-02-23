const express = require("express");
const app = express();
const PORT = process.env.PORT || 3099;
app.use(express.json());
app.use(express.static("public"));

const Datastore = require("nedb");
const database = new Datastore("database.db");
database.loadDatabase();

app.get("/greet", async function (req, res) {
  res.send({ message: "Hello World" });
});

app.post("/api", async function (req, res) {
  database.insert({
    name: req.body.name,
    status: req.body.status,
    message: req.body.message,
  });
  res.send({ message: "success", data: req.body });
});

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
