const {defineConfig, devices} = require('@playwright/test');
module.exports=defineConfig({
 testDir:'./browser-tests', timeout:240000, expect:{timeout:5000},
 fullyParallel:false, workers:1,
 reporter:[['list'],['json',{outputFile:'browser-tests/results/report.json'}]],
 outputDir:'browser-tests/results/traces',
 use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:[
  {name:'desktop',use:{viewport:{width:1440,height:1000}}},
  {name:'mobile',use:{...devices['Pixel 7'],defaultBrowserType:'chromium'}}
 ],
 webServer:{command:'node server.cjs',url:'http://127.0.0.1:4173',reuseExistingServer:true}
});
