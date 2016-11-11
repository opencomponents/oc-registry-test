'use strict';

const expect = require('chai').expect;
const request = require('minimal-request');

const getParams = () => {
  if(process.argv.length < 3){
    console.log('Usage: oc-registry-test https://your-registry-url.domain.com');
    process.exit(1);
  }

  return (process.argv[2]);
};

const getRegistryVersion = (registryUrl, cb) => {
  request({
    url: registryUrl,
    json: true
  }, (err, response) => err ? cb(`Unable to connect to registry: ${err}`) : cb(err, response.ocVersion));
};

let url = getParams();

if(url.slice(-1) !== '/'){
  url = `${url}/`;
}

describe(`When connecting to registry ${url}`, () => {

  it('should connect via http', (done) => {
    
    request({
      json: true,
      timeout: 20000,
      url: url.replace('https://', 'http://')
    }, (err, res) => {
      expect(err).to.be.null;
      expect(res.type).to.equal('oc-registry');
      done();
    });
  });

  it('should connect via https', (done) => {
    
    request({
      json: true,
      timeout: 20000,
      url: url.replace('http://', 'https://')
    }, (err, res) => {
      expect(err).to.be.null;
      expect(res.type).to.equal('oc-registry');
      done();
    });
  });

  it('should be able to serve rendered components', (done) => {
    
    request({
      json: true,
      timeout: 20000,
      url: `${url}oc-client`
    }, (err, res) => {
      expect(err).to.be.null;
      expect(res.renderMode).to.equal('rendered');
      done();
    });
  });

  it('should be able to serve unrendered components', (done) => {
    
    request({
      json: true,
      headers: {
        'accept': 'application/vnd.oc.unrendered+json'
      },
      timeout: 20000,
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
        json: true,
        headers: {
          'accept': 'application/vnd.oc.unrendered+json'
        },
        timeout: 20000,
        url: `${url}oc-client`
      }, (err, res) => {
        ocClientVersion = res.version;
        cdnUrl = res.data.staticPath.split('oc-client')[0];
        done();
      });
    });

    it('should connect via http', (done) => {
      request({
        json: true,
        timeout: 20000,
        url: `http:${cdnUrl}oc-client/${ocClientVersion}/package.json`
      }, (err, res) => {
        expect(err).to.be.null;
        expect(res.name).to.equal('oc-client');
        done();
      });
    });

    it('should connect via https', (done) => {
      request({
        json: true,
        timeout: 20000,
        url: `https:${cdnUrl}oc-client/${ocClientVersion}/package.json`
      }, (err, res) => {
        expect(err).to.be.null;
        expect(res.name).to.equal('oc-client');
        done();
      });
    });

    it('should not be able to access protected source-code', (done) => {
      request({
        timeout: 20000,
        url: `https:${cdnUrl}oc-client/${ocClientVersion}/server.js`
      }, (err, res) => {
        expect(err).to.equal(403);
        done();
      });
    });
  });
});