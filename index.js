const epiiPages = require("epii-puppeteer-balance-pages");
const socket_server = require("epii-socket-server");
var on_error = null;

/*
 let config={
page_num :5,
chrome_launch:[],
launch_type:0,
socket_host_port:"0.0.0.0:4005"
 }
 */

async function start(config, handler) {
    await epiiPages.launch(config.page_num ? config.page_num : 1, config.chrome_launch ? config.chrome_launch : null, config.launch_type ? config.launch_type : 0).catch(e => {
        if (on_error != null) {
            on_error(e);
        }
    });

    socket_server.start(config.socket_host_port ? config.socket_host_port : "0.0.0.0:4005", function (string, client) {
        if (handler) {
            const data = JSON.parse(string);

            client.writeJsonAndCloseAndPageRelease = (json, page) => {
                client.write(JSON.stringify(json));
                client.close();
                page.release();
            }
            handler(epiiPages, data, client);
        }

    });
    socket_server.onerror(function () {
        if (on_error != null) {
            on_error(e);
        }
    });
};


module.exports = {
    start: start,
    onerror: f => on_error = f
};
