import sinon from 'sinon';
import xhr from 'xhr';
import {assert} from 'chai';
import any from '@travi/any';
import {createFetcher} from '../../../src/client/fetcher';

const {getResource, getResources, getNav} = createFetcher();

suite('client-side data fetcher', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(xhr, 'get');
  });

  teardown(() => {
    sandbox.restore();
  });

  suite('individual resource', () => {
    test('that a GET request is made for an individual resource', () => {
      const type = any.string();
      const id = any.integer();
      const resource = any.simpleObject();

      xhr.get.withArgs(`/${type}/${id}`).yields(null, {body: JSON.stringify({resource})});

      return assert.becomes(getResource(type, id), resource);
    });

    test('that a fetch error results in a rejected promise', () => {
      const type = any.string();
      const id = any.integer();
      const error = any.word();

      xhr.get.yields(error);

      return assert.isRejected(getResource(type, id), new RegExp(error));
    });
  });

  suite('resource list', () => {
    test('that a GET request is made for an individual resource', () => {
      const type = any.string();
      const resources = any.listOf(any.simpleObject);

      xhr.get.withArgs(`/${type}`).yields(null, {body: JSON.stringify({[type]: resources})});

      return assert.becomes(getResources(type), resources);
    });

    test('that a fetch error results in a rejected promise', () => {
      const type = any.string();
      const error = any.word();

      xhr.get.yields(error);

      return assert.isRejected(getResources(type), new RegExp(error));
    });
  });

  suite('nav', () => {
    test('that a GET request is made for the primary-nav', () => {
      const primaryNav = any.listOf(any.simpleObject);

      xhr.get.withArgs('/').yields(null, {body: JSON.stringify({primaryNav})});

      return assert.becomes(getNav(), primaryNav);
    });

    test('that a fetch error results in a rejected promise', () => {
      const error = any.word();

      xhr.get.yields(error);

      return assert.isRejected(getNav(), new RegExp(error));
    });
  });
});
