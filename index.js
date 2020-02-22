const http = require("http");
const express = require("express");

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 8080;

const path = require("path");
const fs = require("fs");
const { uuid } = require('uuidv4');


const app = express();
const server = http.createServer(app);

const {runCmd} = require("./process_executor");


server.listen(port);
server.on('listening', () => {
    console.log(`Server running on ${host}:${port}`);
});


app.use('/', express.static(path.join(__dirname, "public")) );
app.use("/xterm", express.static( path.join(__dirname, 'node_modules', "xterm") ) );

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.get("/", (req,res) => {

//     const f = require("fs").readFileSync(__dirname + "/index.html", {encoding:"utf-8"});

//     res.send(f);
// });

app.post("/run", async (req, res) => {

    const commands = req.body.commands.split(/\r?\n/);

    const data = [];

    for(let command of commands) {
        const file = path.join(__dirname, "tmp", "command-" + uuid() + "_" + Date.now() + ".tmp");

        fs.writeFileSync(file, command);
        
        const [stdout, stderr] = await runCmd(file);

        data.push({
            command,
            stdout,
            stderr
        });

        fs.unlinkSync(file);
    }

    return res.json(data);

});