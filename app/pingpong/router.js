var fs = require('fs');
var iai = require('iai');
var log = iai.log;

var path = iai.path(__dirname);

// TODO this should be an express.Router
// so it does not suck as now :D
module.exports = function( req, res ){
  if( req.url === '/' ){
    return fs.createReadStream( path.to('index.html') ).pipe(res);
  }
  if( req.url === '/frontend.js' ){
    return fs.createReadStream( path.to('frontend.js') ).pipe(res);
  }
  log.warn('do NOT KNOW what to do now');
  log.debug( 'req.url=', req.url );
  res.end('hi there!');
};
