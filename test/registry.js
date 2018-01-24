'use strict';

const expect = require('chai').expect;
const request = require('minimal-request');

const printUsage = () => {
  console.log('\nUsage: oc-registry-test <registry-url> <options>');
  console.log('\nwhere <registry-url> is your registry url, e.g. https://your-registry-url.domain.com');
  console.log('\nOptions:\n\t--http\tCheck against http as well as https.');
  console.log('\n\t--help\tDisplay this help text\n')
}

const getParams = () => {
  let opts = {
    boolean: true,
    default: {
      http: false,
      httponly: false,
      help: false
    }
  };
  let argv = require('minimist')(process.argv.slice(2),opts);

  if (argv._.length === 0 || argv.help){
    printUsage();
    process.exit(1);
  }

  return argv;
};

let url = getParams()._[0];
let httpCheck = getParams().http;
let httpOnly = getParams().httponly;

if(url.slice(-1) !== '/'){
  url = `${url}/`;
}

const timeout = 20000;
const json = true;

describe(`When connecting to registry ${url}`, () => {

  if (httpCheck || httpOnly) {
    it('should connect via http', (done) => {

      request({
        json, timeout,
        url: url.replace('https://', 'http://')
      }, (err, res) => {
        expect(err).to.be.null;
        expect(res.type).to.equal('oc-registry');
        done();
      });
    });
  }

  if (!httpOnly) {
    it('should connect via https', (done) => {

      request({
        json, timeout,
        url: url.replace('http://', 'https://')
      }, (err, res) => {
        expect(err).to.be.null;
        expect(res.type).to.equal('oc-registry');
        done();
      });
    });
  }

  it('should be able to serve rendered components', (done) => {

    request({
      json, timeout,
      url: `${url}oc-client`
    }, (err, res) => {
      expect(err).to.be.null;
      expect(res.renderMode).to.equal('rendered');
      done();
    });
  });

  it('should be able to serve unrendered components', (done) => {

    request({
      json, timeout,
      headers: {
        'accept': 'application/vnd.oc.unrendered+json'
      },
      url: `${url}oc-client`
    }, (err, res) => {
      expect(err).to.be.null;
      expect(res.renderMode).to.equal('unrendered');
      done();
    });
  });

  describe('when accessing cdn', () => {

    let cdnUrl, ocClientVersion;

    beforeEach((done) => {
      request({
        json, timeout,
        headers: {
          'accept': 'application/vnd.oc.unrendered+json'
        },
        url: `${url}oc-client`
      }, (err, res) => {
        ocClientVersion = res.version;
        cdnUrl = res.data.staticPath.split('oc-client')[0];
        done();
      });
    });

    if (httpCheck || httpOnly) {
      it('should connect via http', (done) => {
        request({
          json, timeout,
          url: `http:${cdnUrl}oc-client/${ocClientVersion}/package.json`
        }, (err, res) => {
          expect(err).to.be.null;
          expect(res.name).to.equal('oc-client');
          done();
        });
      });
    }

    if (!httpOnly) {
      it('should connect via https', (done) => {
        request({
          json, timeout,
          url: `https:${cdnUrl}oc-client/${ocClientVersion}/package.json`
        }, (err, res) => {
          expect(err).to.be.null;
          expect(res.name).to.equal('oc-client');
          done();
        });
      });
    }

    if (httpCheck || httpOnly) {
      it('should not be able to access protected source-code', (done) => {
        request({
          timeout,
          url: `http:${cdnUrl}oc-client/${ocClientVersion}/server.js`
        }, (err, res, details) => {
          expect(err || details.response.statusCode).to.equal(403);
          done();
        });
      });
    }

    if (!httpOnly) {
      it('should not be able to access protected source-code', (done) => {
        request({
          timeout,
          url: `https:${cdnUrl}oc-client/${ocClientVersion}/server.js`
        }, (err, res, details) => {
          expect(err || details.response.statusCode).to.equal(403);
          done();
        });
      });
    }

  });
});
