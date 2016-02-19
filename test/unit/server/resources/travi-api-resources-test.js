'use strict';

const
    traviApiResources = require('../../../../lib/server/resources/travi-api-resources.js'),
    traverson = require('traverson'),
    any = require('../../../helpers/any-for-admin'),
    sinon = require('sinon'),
    assert = require('chai').assert;

suite('travi-api resource interactions', () => {
    let stubForGet;

    setup(() => {
        stubForGet = sinon.stub();
        sinon.stub(traverson, 'from');
    });

    teardown(() => {
        traverson.from.restore();
    });

    test('that links are requested from the api catalog', () => {
        const
            callback = sinon.spy(),
            links = {
                'self': any.url(),
                'foo': any.url()
            };
        traverson.from.withArgs('https://api.travi.org/').returns({
            getResource: stubForGet
        });
        stubForGet.yields(null, { '_links': links });

        traviApiResources.getLinksFor('catalog', callback);

        assert.calledWith(callback, null, links);
    });

    test('that list of resources requested by following link from api catalog', () => {
        const
            resourceType = any.string(),
            resources = any.listOf(any.resource),
            responseFromApi = {
                _embedded: {}
            },
            callback = sinon.spy();
        /*eslint-disable no-underscore-dangle */
        responseFromApi._embedded[resourceType] = resources;
        /*eslint-enable no-underscore-dangle */
        traverson.from.withArgs('https://api.travi.org/').returns({
            follow: sinon.stub().withArgs(resourceType).returns({
                getResource: stubForGet.yields(null, responseFromApi)
            })
        });

        traviApiResources.getListOf(resourceType, callback);

        assert.calledWith(callback, null, resources);
    });

    test('that error bubbles from resources request', () => {
        const
            resourceType = any.string(),
            error = any.simpleObject(),
            callback = sinon.spy();
        traverson.from.withArgs('https://api.travi.org/').returns({
            follow: sinon.stub().withArgs(resourceType).returns({
                getResource: stubForGet.yields(error)
            })
        });

        traviApiResources.getListOf(resourceType, callback);

        assert.calledWith(callback, error);
    });

    test('that a single resource is mapped to a list', () => {
        const
            resourceType = any.string(),
            responseFromApi = {
                _embedded: {}
            },
            resource = any.resource(),
            callback = sinon.spy();
        /*eslint-disable no-underscore-dangle */
        responseFromApi._embedded[resourceType] = resource;
        /*eslint-enable no-underscore-dangle */
        traverson.from.withArgs('https://api.travi.org/').returns({
            follow: sinon.stub().withArgs(resourceType).returns({
                getResource: stubForGet.yields(null, responseFromApi)
            })
        });

        traviApiResources.getListOf(resourceType, callback);

        assert.calledWith(callback, null, [resource]);
    });

    test('that specific resource requested by following links', () => {
        const
            resourceType = any.string(),
            resourceId = any.int(),
            resource = any.resource(),
            callback = sinon.spy();
        traverson.from.withArgs('https://api.travi.org/').returns({
            follow: sinon.stub().withArgs(resourceType, `${resourceType}[id:${resourceId}]`).returns({
                getResource: stubForGet.yields(null, resource)
            })
        });

        traviApiResources.getResourceBy(resourceType, resourceId, callback);

        assert.calledWith(callback, null, resource);
    });

    test('that error bubbles from resource request', () => {
        const
            resourceType = any.string(),
            resourceId = any.int(),
            callback = sinon.spy(),
            error = any.simpleObject();
        traverson.from.withArgs('https://api.travi.org/').returns({
            follow: sinon.stub().withArgs(resourceType, `${resourceType}[id:${resourceId}]`).returns({
                getResource: stubForGet.yields(error)
            })
        });

        traviApiResources.getResourceBy(resourceType, resourceId, callback);

        assert.calledWith(callback, error);
    });
});
