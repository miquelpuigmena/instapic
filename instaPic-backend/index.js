import server from './server.js';
// LISTEN
server.app.listen(server.app.get('port'), () => console.log(`App started on port ${server.app.get('port')}`));

