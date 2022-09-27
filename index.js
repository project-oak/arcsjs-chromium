import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import tmp from "tmp";
import { exec } from "child_process";

const app = express();

app.use(express.static("pkg"));
app.use(bodyParser.text({ type: 'text/plain' }));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/pkg/demo/quill/index.html");
});

const RAKSHA_BINARY = '/usr/src/app/raksha/bazel-bin/src/backends/policy_engine/souffle/check_policy_compliance';
const RAKSHA_POLICY = '/usr/src/app/raksha/src/backends/policy_engine/souffle/testdata/arcsjs_policy_rules.txt';

app.post("/raksha", async function (req, res) {
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
        if (err) { console.error(err); res.send("1"); } else {
          res.send("0");
        }
        console.log(stdout);
      });
  });
});

app.listen(3000, function () {
  console.log("Starting server at port 3000...");
});
