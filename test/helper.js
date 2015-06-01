
exports.resume = function( ){
  process.stdin.resume();
  process.on( 'SIGINT', last.bind(0, Error('stoped by user')) );
  console.log('Resumed stdin to avoid a premature exit');
  console.log('If it takes too long to complete, use ^C');
  console.log();

  function last( err ){
    if( err ){
      console.error('expecting no errors but got:');
      console.error( err.stack );
    }
    process.exit( err? 1 : 0 );
  }
  return last;
};
