const app = require('./src/app');

// Start the server - set PORT in your environment to change the default port
app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
