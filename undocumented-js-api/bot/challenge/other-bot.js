const puppeteer = require('puppeteer');
const fs = require('fs');
const net = require('net');

const FLAG = fs.readFileSync('/flag.txt').toString();
const puppeter_args = {};
  puppeter_args.headless = true;
  puppeter_args.args = [
    '--user-data-dir=/tmp/chrome-userdata',
    '--breakpad-dump-location=/tmp/chrome-crashes'
  ];

(async function(){
  const browser = await puppeteer.launch(puppeter_args);

  function ask_for_url(socket) {
      socket.state = 'URL';
      socket.write('Please send me a URL to open.\n');
  }

  async function load_url(socket, data) {
    let url = data.toString().trim();
    console.log(`checking url: ${url}`);
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      socket.state = 'ERROR';
      socket.write('Invalid scheme (http/https only).\n');
      socket.destroy();
      return;
    }
    socket.state = 'LOADED';
    
    // wtf is going on with this shit ????? why tf does IncognitoContext not work ?
    const context = await browser.defaultBrowserContext();
    const page = await context.newPage();
    await page.goto("https://chall1.jsapi.tech/", {
        waitUntil: 'networkidle2'
    });
    await page.evaluate( function ( flag ) {
      window.localStorage.setItem( 'note', flag );
    }, FLAG )
    await page.waitForTimeout(500);
    socket.write(`Clicking on ${url}.\n`)
    console.log(url);
    try {
    socket.write(`Loading page ${url}.\n`);
    await page.goto(url);
    setTimeout(()=>{
      try {
        page.close();
        context.destroy();
        socket.write('No issues found with the page!\nNavigating away from page.\n');
        socket.destroy();
      } catch (err) {
        console.log(`err: ${err}`);
      }
      }, 60000);
    } catch (err) {console.log(err)}
  }

  var server = net.createServer();
  server.listen(1338);
  console.log('listening on port 1338');

  server.on('connection', socket=>{
    socket.on('data', data=>{
      try {
        if (socket.state == 'URL') {
          load_url(socket, data);
        }
      } catch (err) {
        console.log(`err: ${err}`);
      }
    });

    try {
      ask_for_url(socket);
    } catch (err) {
      console.log(`err: ${err}`);
    }
  });
})();