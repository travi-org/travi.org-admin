'use strict';

const
    path = require('path'),
    loadApi = require(path.join(__dirname, '../../../../lib/server/app.js')),

    nock = require('nock'),
    assert = require('referee').assert,
    _ = require('lodash'),
    any = require('../../../helpers/any-for-admin');
require('setup-referee-sinon/globals');

module.exports = function () {
    const HOST = 'https://api.travi.org';

    let resources = {},
        existingResourceId,
        serverResponse;

    function getSingularForm(resourceType) {
        return resourceType.substring(0, resourceType.length - 1);
    }

    function buildHalLink(href) {
        return {href};
    }

    function buildLinksIncluding(resourceType, resourceLink) {
        const links = {
            'self': buildHalLink(any.url(HOST))
        };

        if (resourceLink) {
            links[resourceType] = buildHalLink(resourceLink);
        }

        return links;
    }

    function buildListOf(resource) {
        let resourceList,
            existingResource;

        resourceList = any.listOf(resource);

        if (existingResourceId) {
            existingResource = resource();

            existingResource.id = existingResourceId;

            resourceList.push(existingResource);
        }

        return resourceList;
    }

    function prepareListForResponse(resourceType) {
        let resourceList;

        if (any.resources.hasOwnProperty(getSingularForm(resourceType))) {
            resourceList = buildListOf(any.resources[getSingularForm(resourceType)]);
        } else {
            resourceList = buildListOf(any.resource);
        }

        _.map(resourceList, function (resource) {
            if (_.isObject(resource)) {
                resource._links = buildLinksIncluding();
            }

            return resource;
        });

        resources[resourceType] = resourceList;

        return resourceList;
    }

    function setupExpectedApiResponsesFor(resourceType) {
        const
            requestPath = `/${resourceType}`,
            resourceLink = HOST + requestPath,
            headers = {'Content-Type': 'application/hal+json'},
            embedded = {
                [resourceType]: prepareListForResponse(resourceType)
            },
            document = {
                _embedded: embedded
            };

        nock(HOST)
            .log(console.log)   //eslint-disable-line no-console
            .get('/')
            .times(2)
            .reply(
                200,
                {_links: buildLinksIncluding(resourceType, resourceLink)},
                headers
            );

        nock(HOST)
            .log(console.log)   //eslint-disable-line no-console
            .get(requestPath)
            .reply(
                200,
                document,
                headers
            );

        if (existingResourceId) {
            _.each(document._embedded[resourceType], function (resource) {
                if (resource.id === existingResourceId) {
                    const
                        link = resource._links.self.href,
                        linkHost = link.substring(0, link.lastIndexOf('/')),
                        resourcePath = link.substring(linkHost.length);

                    nock(linkHost)
                        .log(console.log)   //eslint-disable-line no-console
                        .get(resourcePath)
                        .reply(
                            200,
                            {},
                            headers
                        );
                }
            });
        }
    }

    function assertFormatIsUntouchedFor(resourceType) {
        const list = JSON.parse(serverResponse.payload).resources;

        assert.isArray(list);
        assert.match(list, resources[resourceType]);
    }

    function assertFormatMappedToViewFor(resourceType) {
        const list = JSON.parse(serverResponse.payload).resources;
        let mappedResource;

        _.each(resources[resourceType], function (resource, index) {

            if ('users' === resourceType) {
                mappedResource = {
                    id: resource.id,
                    displayName: `${resource['first-name']} ${resource['last-name']}`,
                    thumbnail: resource.avatar
                };
            } else if ('rides' === resourceType) {
                mappedResource = {
                    id: resource.id,
                    displayName: resource.nickname
                };
            }

            assert.isArray(list);
            assert.match(list[index], mappedResource);
        });
    }

    this.Before(function () {
        nock.disableNetConnect();
    });

    this.After(function () {
        nock.enableNetConnect();
        nock.cleanAll();
        resources = {};
        existingResourceId = null;
        serverResponse = null;
    });

    this.Given(/^list of "([^"]*)" resources exists in the api$/, function (resourceType, callback) {
        setupExpectedApiResponsesFor(resourceType);

        callback();
    });

    this.Given(/^list of "([^"]*)" contains one entry$/, function (resourceType, callback) {
        const
            embedded = {},
            host = 'https://api.travi.org',
            requestPath = `/${resourceType}`,
            resourceLink = host + requestPath,
            headers = {'Content-Type': 'application/hal+json'};

        nock(host)
            .get('/')
            .times(2)
            .reply(
                200,
                {_links: buildLinksIncluding(resourceType, resourceLink)},
                headers
            );

        if (any.resources.hasOwnProperty(getSingularForm(resourceType))) {
            embedded[resourceType] = any.resources[getSingularForm(resourceType)]();
        } else {
            embedded[resourceType] = any.resource();
        }
        resources[resourceType] = [embedded[resourceType]];

        nock(host)
            .get(requestPath)
            .reply(
                200,
                { _embedded: embedded },
                headers
            );

        callback();
    });

    this.Given(/^a "([^"]*)" exists in the api$/, function (resourceType, callback) {
        existingResourceId = any.int();
        setupExpectedApiResponsesFor(resourceType);

        callback();
    });

    this.When(/^list of "([^"]*)" resources is requested$/, function (resourceType, callback) {
        loadApi.then(function (server) {
            server.inject({
                method: 'GET',
                url: `/${resourceType}`
            }, function (response) {
                serverResponse = response;
                callback();
            });
        });
    });

    this.When(/^the "([^"]*)" is requested by id$/, function (resourceType, callback) {
        loadApi.then(function (server) {
            server.inject({
                method: 'GET',
                url: `/${resourceType}/${existingResourceId}`
            }, function (response) {
                serverResponse = response;
                callback();
            });
        });
    });

    this.Then(/^list of "([^"]*)" resources is returned$/, function (resourceType, done) {
        if (any.resources.hasOwnProperty(getSingularForm(resourceType))) {
            assertFormatMappedToViewFor(resourceType);
        } else {
            assertFormatIsUntouchedFor(resourceType);
        }

        done();
    });

    this.Then(/^the "([^"]*)" is returned$/, function (resourceType, done) {
        const payload = JSON.parse(serverResponse.payload);

        assert.equals(payload.resource.id, existingResourceId);

        done();
    });
};
