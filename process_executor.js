const child_process = require("child_process");
const fs = require("fs");
const processes = [];

function runCmd(file) {

    return new Promise((resolve, reject) => {

        // const stdin = 

        const term = child_process.exec("bash " + file, {
            cwd : __dirname,
            shell : true,
            windowsHide : false,
        });

        // return ;

        let processData = {
            process : term,
            closed : false,
        };
    
        let data = '';
        let err = '';
    
        term.stdout.on("data" , chunk => {
            data += chunk.toString();
        })
    
        term.stderr.on("data" , chunk => {
            err += chunk.toString();
        })


        term.on("close", code => {

            processData.closed = true
            resolve([data, err]);
        });

        term.on("error", err => {
            reject(err);
        });

        processes.push(processData);

        // term.kill()
    })
}





function exitHandler(options, exitCode) {
    
    processes.forEach(proc => {
        if(!proc.closed) {
            proc.process.kill();
        }
        // console.log(proc);
    });

    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));


module.exports = {
    processes,
    runCmd
}