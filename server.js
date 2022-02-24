const express = require("express");
const app = express();
const axios = require("axios");
const PORT = process.env.PORT || 3099;
app.use(express.json());
app.use(express.static("public"));
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const Datastore = require("nedb");
const res = require("express/lib/response");
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

app.post("/startBot", async (req, res) => {
  const authURL = "https://auto04.treasuryone.co.za/v1/authentication";
  const un = "treaserauto04"; // "botc1",
  pw = "Monday@99";

  try {
    const res_data = await axios.post(authURL, {
      username: un,
      password: pw,
    });
    // console.log(res.data.token);
    const token = res_data.data.token;

    if (token) {
      const resDeploy = await axios.post(
        "https://auto04.treasuryone.co.za/v3/automations/deploy",
        {
          fileId: 66772, //id of the bot to execute
          runAsUserIds: [
            4, //id(s) of the user account to run the bot - must have default device unless specified below
          ],
          poolIds: [],
          overrideDefaultDevice: false,
          callbackInfo: {
            url: "https://callbackserver.com/storeBotExecutionStatus", //Callback URL - not required, but can be used - can be removed if no callback needed
            headers: {
              "X-Authorization": token, //Callback API headers. Headers may contain authentication token, content type etc. Both key & value are of type string.
            },
          },
          botInput: {
            //optional values to map to the bot...NOTE: These values must match the exact variable names and must be defined as input values
            sInput1: {
              type: "STRING", //Type can be [ STRING, NUMBER, BOOLEAN, LIST, DICTIONARY, DATETIME ]
              string: req.body.sInput1, //key must match type, in this case string
            },
            sInput2: {
              type: "STRING",
              string: req.body.sInput2,
            },
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Authorization": token,
          },
        }
      );

      let response = resDeploy.data;
      console.log("deploy bot now...");
      console.log(resDeploy.data);

      res.send({
        message: "Bot executed",
        deploymentId: response.deploymentId,
        body: req.body,
      });
    }
  } catch (ex) {
    console.log(ex.response);
  }
});

// (function getAPIData() {
//   console.log("jsonplaceholder...");
//   axios
//     .get("https://jsonplaceholder.typicode.com/todos/1")
//     .then((response) => console.log(response.data));
// })();

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
