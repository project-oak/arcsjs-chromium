
import express from "express";
import cors from 'cors';
import bodyParser from "body-parser";
import fs from "fs";
import tmp from "tmp";
import { exec } from "child_process";

const app = express();

app.use(express.static("pkg"));
app.use(bodyParser.text({ type: 'text/plain' }));

app.get("/", function (req, res) {
  res.redirect("/demo/quill/index.html");
});

const RAKSHA_BINARY = '/usr/src/app/raksha/check_policy_compliance';
const RAKSHA_POLICY = '/usr/src/app/raksha/arcsjs_policy_rules.txt';

app.post("/raksha", cors(), async function (req, res) {
    const data = req.body;
    tmp.file(function (err, path, fd, cleanup) {
      if (err) throw err;
      fs.appendFile(path, new Buffer(data), function (err) {
        if (err) {
          res.send("2");
        }
      });
      exec(`${RAKSHA_BINARY} --ir ${path} --sql_policy_rules=${RAKSHA_POLICY} --policy_engine=`,
          async (err, stdout, stderr) => {
        const result = err ? 1 : 0;
        console.log(stdout);
        console.log(stderr);
        if (req.query.json) {
          res.json({result, stdout, stderr}); 
        } else {
          res.send(result.toString()); 
        }
      });
  });
});

app.listen(3000, function () {
  console.log("Starting server at port 3000...");
});
