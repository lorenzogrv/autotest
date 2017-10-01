var assert = require("chai").assert
  , iai = require("../..")
  , test = iai( "test" )
  , validators = iai( "data/validators" )
  , ValidationError = validators
;

function testOk( validator, value ){
  return function(){
    validator(value)
  }
}

function testFail( validator, value, err_match ){
  return function(){
    try {
      validator(value);
      throw Error("expecting ValidationError");
    } catch(err) {
      assert.instanceOf( err, ValidationError );
      if( err_match ){
        assert.match( err.message, err_match, "bad error message")
      }
    }
  }
}

//describe( "empty")

describe( "RegExpValidator", function(){
  it( "should be a function that returns a function", function(){
    assert.isFunction( validators.RegExp, "should be a function" );
    assert.isFunction( validators.RegExp(), "should return a function" );
  })
  describe( "returned function", function(){

    var validator = validators.RegExp({ re: /RegularExpresion/ });

    it( "should pass the following cases", function(){
      validator( "RegularExpresion" )
    })

    it( "should throw on the following cases", function(){
      var cases = test( /.*/ );
      for( var caseName in cases ){
        testFail( validator, cases[caseName] );
      }
    })
  })
})

describe( "EmailValidator", function(){
  it( "should be a function that returns a function", function(){
    assert.isFunction( validators.Email, "should be a function" );
    assert.isFunction( validators.Email(), "should return a function" );
  })
  it( "should be exposed on validators.email", function(){
    assert.isFunction( validators.email );
  })
  describe( "success cases", function(){
    [
      "test@test.com",
      "test@io",
      "test@iana.org",
      "test@nominet.org.uk",
      "test@about.museum",
      "a@iana.org",
      "test@e.com",
      "test@iana.a",
      "test.test@iana.org",
      "!#$%&`*+/=?^`{|}~@iana.org",
      "123@iana.org",
      "test@123.com",
      "test@iana.123",
      "test@255.255.255.255",
      "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghiklm@iana.org",
      "test@abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghikl.com",
      "test@mason-dixon.com",
      "test@c--n.com",
      "test@iana.co-uk",
      "a@a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v",
      "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghiklm@abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghikl.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghikl.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghi",
      '"test"@iana.org',
      '""@iana.org',
      '"\a"@iana.org',
      'test@[255.255.255.255]',
      'test@[IPv6:1111:2222:3333:4444:5555:6666:7777:8888]', //
      'test@[IPv6:1111:2222:3333:4444:5555:6666::8888]', //
      'test@[IPv6:1111:2222:3333:4444:5555::8888]', //
      'test@[IPv6:::3333:4444:5555:6666:7777:8888]', //
      'test@[IPv6:::]', //
      'test@[IPv6:1111:2222:3333:4444:5555:6666:255.255.255.255]',//
      'test@[IPv6:1111:2222:3333:4444::255.255.255.255]',//

      'test@xn--hxajbheg2az3al.xn--jxalpdlp', //
      'xn--test@iana.org', //
      'test@org',//
      'test@test.com',//
      'test@nic.no'
    ].forEach(function(value){
      it("'"+value+"'", testOk(validators.email, value))
    })
  })

  describe( "fail cases", function(){
    [
      "",
      "test",
      "@",
      "test@",
      "@io",
      "@iana.org",
      ".test@iana.org",
      "test.@iana.org",
      "test..iana.org",
      "test_exa-mple.com",
      "test\\@test@iana.org",
      "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghiklmn@iana.org",
      "test@abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghiklm.com",
      "test@-iana.org",
      "test@iana-.com",
      "test@.iana.org",
      "test@iana.org.",
      "test@iana..com",
      "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghiklm@abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghikl.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghikl.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghij",
      "a@abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghikl.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghikl.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghikl.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefg.hij",
      "a@abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghikl.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghikl.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghikl.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefg.hijk",
      '"""@iana.org',
      '"\""@iana.org',
      '"\\\"@iana.org',
      'test"@iana.org',
      '"test@iana.org',
      '"test"test@iana.org',
      'test"text"@iana.org',
      '"test""test"@iana.org',
      '"test"."test"@iana.org',
      '"test".test@iana.org',
      '"test␀"@iana.org',
      '"test\\␀"@iana.org',
      '"abcdefghijklmnopqrstuvwxyz␠abcdefghijklmnopqrstuvwxyz␠abcdefghj"@iana.org',
      '"abcdefghijklmnopqrstuvwxyz␠abcdefghijklmnopqrstuvwxyz␠abcdefg\\h"@iana.org',
      'test@a[255.255.255.255]',
      'test@[255.255.255]',
      'test@[255.255.255.255.255]',
      'test@[255.255.255.256]',
      'test@[1111:2222:3333:4444:5555:6666:7777:8888]',
      'test@[IPv6:1111:2222:3333:4444:5555:6666:7777]',
      'test@[IPv6:1111:2222:3333:4444:5555:6666:7777:8888:9999]',
      'test@[IPv6:1111:2222:3333:4444:5555:6666:7777:888G]',
      'test@[IPv6:1111:2222:3333:4444:5555:6666::7777:8888]',
      'test@[IPv6::3333:4444:5555:6666:7777:8888]',
      'test@[IPv6:1111::4444:5555::8888]',
      'test@[IPv6:1111:2222:3333:4444:5555:255.255.255.255]',
      'test@[IPv6:1111:2222:3333:4444:5555:6666:7777:255.255.255.255]',
      'test@[IPv6:1111:2222:3333:4444:5555:6666::255.255.255.255]',
      'test@[IPv6:1111:2222:3333:4444:::255.255.255.255]',
      'test@[IPv6::255.255.255.255]',
      '␠test␠@iana.org',
      'test@␠iana␠.com',
      'test␠.␠test@iana.org',
      '␍␊␠test@iana.org',
      '␍␊␠␍␊␠test@iana.org',
      '(comment)test@iana.org',
      '((comment)test@iana.org',
      '(comment(comment))test@iana.org',
      'test@(comment)iana.org',
      'test(comment)test@iana.org',
      'test@(comment)[255.255.255.255]',
      '(comment)abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghiklm@iana.org',
      'test@(comment)abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghikl.com',
      '(comment)test@abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghik.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghik.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijk.abcdefghijklmnopqrstuvwxyzabcdefghijk.abcdefghijklmnopqrstu',
      'test@iana.org␊',
      'test@iana.org-',
      '"test@iana.org',
      '(test@iana.org',
      'test@(iana.org',
      'test@[1.2.3.4',
      '"test\\"@iana.org',
      '(comment\\)test@iana.org',
      'test@iana.org(comment\\\)',
      'test@iana.org(comment\\',
      'test@[RFC-5322-domain-literal]',
      'test@[RFC-5322]-domain-literal]',
      'test@[RFC-5322-[domain-literal]',
      'test@[RFC-5322-\\␇-domain-literal]',
      'test@[RFC-5322-\\␉-domain-literal]',
      'test@[RFC-5322-\\]-domain-literal]',
      'test@[RFC-5322-domain-literal\\]',
      'test@[RFC-5322-domain-literal\\',
      'test@[RFC␠5322␠domain␠literal]',
      'test@[RFC-5322-domain-literal]␠(comment)',
      '@iana.org',
      'test@.org',
      '""@iana.org',
      '"\\"@iana.org',
      '()test@iana.org',
      'test@iana.org␍',
      '␍test@iana.org',
      '"␍test"@iana.org',
      '(␍)test@iana.org',
      'test@iana.org(␍)',
      '␊test@iana.org',
      '"␊"@iana.org',
      '"\\␊"@iana.org(␊)',
      '␇@iana.org',
      'test@␇.org',
      '"␇"@iana.org',
      '"\\"@iana.org',
      '(␇)test@iana.org',
      '␍␊test@iana.org',
      '␍␊␠␍␊test@iana.org',
      '␠␍␊test@iana.org',
      '␠␍␊␠test@iana.org␠␍␊',
      '␠␍␊test@iana.org␠␍␊',
      '␍␊test@iana.org␠␍␊',
      '␍␊␠test@iana.org',
      'test@iana.org␍␊␠',
      'test@iana.org␍␊␠␍␊',
      '␠test@iana.org␍␊',
      'test@iana.org␍␊',
      '␠␍␊test@iana.org␠␍␊',
      'test@iana.org␠␍␊',
      '␠test@iana.org␠␍␊',
      '␠␍␊test@iana.org␠␍␊',
      '␍␊test@iana.org␠␍␊',
      'test@iana.org␠',
      'test@[IPv6:1::2:]',
      '"test\\"@iana.org',
      'test@iana/icann.org',
      'test.(comment)test@iana.org'
    ].forEach(function(value){
      it("'"+value+"'", testFail(validators.email, value))
    })
  })
})



function autoTest( name, validator, regexp ){
  describe( name, function(){
    it( "should be a function", function(){
      assert.isFunction( validator );
    })
    var cases = test( regexp );
    for( var caseName in cases ){
    it( "should pass given "+caseName, testOk(validator, cases[caseName]) );
    }
    cases = test( regexp, "reverse" );
    for( var caseName in cases ){
      it( "should throw given "+caseName, testFail(validator, cases[caseName]) );
    }
  })
}

describe( "builtin rexep validators", function(){
  autoTest( "CamelCase validator", validators.CamelCase, /CamelCase/ );
  autoTest( "camelCase validator", validators.camelCase, /camelCase/ );
  autoTest( "slug validator", validators.slug, /slug/ );
})

describe("Number validator", function(){
  autoTest( "is.Number feature", validators.Number(), /number/ );
  describe( "match_value feature", function(){
    var validator = validators.Number({ match_value: 1988 });
    var cases = test(/.*/);
    for( var caseName in cases ){
      it( "should throw given "+caseName, testFail(validator, cases[caseName]) );
    }
    it( "should pass given the correct match_value", function(){
      validator( 1988 );
    })
    it( "should fail with a descriptive error given not a number", function(){
      try {
        validator( NaN );
      } catch(err) {
        assert.equal( err.code, 'invalid_number' )
      }
    })
    it( "should fail with a descriptive error given a number != match_value", function(){
      try {
        validator( 123456 );
      } catch(err) {
        assert.equal( err.code, 'match_value' )
      }
    })
  })
  describe( "max_value feature", function(){
    var validator = validators.Number({ max_value: 9 });
    function throws( value, message, err_match ){
      testFail( validator, value, /Garanta que este valor sexa menor ou igual a/ )();
    }
    it( "should fail given a number greater than max_value", function(){
      throws( "10", "string '10'" );
      throws( 10, "number 10" );
      throws( 1955, "4 digit number" )
      throws( 10e2, "exponential notation" )
    })
    it( "should pass given a number less than or equal to max_value", function(){
      validator(9);
      validator(6);
      validator(3);
      validator(-15);
      validator("9");
      validator("5");
      validator("-1235");
      validator( 10e-2 )
    })
  })
  describe( "min_value feature", function(){
    var validator = validators.Number({ min_value: 2 });
    function throws( value, message, err_match ){
      testFail( validator, value, /Garanta que este valor sexa maior ou igual a/ )();
    }
    it( "should fail given a number smaller than min_value", function(){
      throws( 1, "number 1" );
      throws( "1", "string '1'" );
      throws( "-1", "string '-1'" );
      throws( "-16", "string '-16'" );
      throws( -16, "number -16" );
      throws( 10e-2, "exponential notation" )
    })
    it( "should pass given a number greater than or equal to min_value", function(){
      validator(2);
      validator(25);
      validator(255006);
      validator("2");
      validator("46");
      validator("50e13");
      validator( 50e13 );
    })
  })
})

describe( "Length validator", function(){
  describe( "max_value feature", function(){
    var validator = validators.Length({ max_value: 9 });
    function throws( value, message, err_match ){
      testFail( validator, value, /Garanta que a lonxitude deste valor sexa menor ou igual a/ )();
    }
    it( "should fail given anything with length greater than limit", function(){
      throws( "1234567890", "10 characters" );
      throws( "abcdefghijklmnñopqrstuvwxyz", "25 characters" );
      throws( Array(10), "Array(10)" )
      throws( Array(123), "Array(123)" )
      throws( { length: 99 }, "fake 99 length object" );
    })
    it( "should pass given anything with length less or equal than limit", function(){
      validator( "123456789", "9 characters" );
      validator( "", "empty string" );
      validator( Array(9), "Array(10)" )
      validator( Array(0), "Array(123)" )
      validator( { length: 3 }, "fake 3 length object" );
    })
  })
  describe( "min_value feature", function(){
    var validator = validators.Length({ min_value: 4 });
    function throws( value, message, err_match ){
      testFail( validator, value, /Garanta que a lonxitude deste valor sexa maior ou igual a/ )();
    }
    it( "should fail given somthing with length smaller than min_value", function(){
      throws( "0", "1 character" );
      throws( "abc", "3 characters" );
      throws( Array(1), "Array(1)" )
      throws( Array(2), "Array(2)" )
      throws( { length: 3 }, "fake 99 length object" );
    })
    it( "should pass given a something with length greater than or equal to min_value", function(){
      validator( "123456789", "9 characters" );
      validator( Array(10), "Array(10)" )
      validator( Array(123), "Array(123)" )
      validator( { length: 4 }, "fake 3 length object" );
    })
  })
})
