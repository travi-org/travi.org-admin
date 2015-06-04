'use strict';

var React = require('react'),
    ReactTestUtils = require('react/lib/ReactTestUtils'),
    assert = require('chai').assert,
    _ = require('lodash'),
    any = require('../../../helpers/any-for-admin'),
    proxyquire = require('proxyquire'),
    LayoutStub = require('../../../helpers/layoutStub.jsx');

var ResourceList = proxyquire('../../../../lib/views/resourceList.jsx', {'./layout/layout.jsx': LayoutStub});

suite('resource list', function () {
    test('that a message is given when no resources are available', function () {
        var resourceType = any.string(),
            element = React.createElement(ResourceList, {
                resources: [],
                resourceType: resourceType,
                types: [
                    'foo',
                    'bar'
                ]
            }),
            rendered = ReactTestUtils.renderIntoDocument(element),
            layoutComponent = ReactTestUtils.findRenderedComponentWithType(rendered, LayoutStub);

        var content = layoutComponent.props.children;
        assert.equal(content.type, 'p');
        assert.equal(content.props.children.join(''), 'No ' + resourceType + ' are available');
    });

    test('that resources are listed', function () {
        var resourceType = any.string(),
            resources = [
                'one',
                'two',
                'three'
            ],
            element = React.createElement(ResourceList, {
                resources: resources,
                resourceType: resourceType,
                types: [
                    'foo',
                    'bar'
                ]
            }),
            rendered = ReactTestUtils.renderIntoDocument(element);

        var layoutComponent = ReactTestUtils.findRenderedComponentWithType(rendered, LayoutStub),
            content = layoutComponent.props.children,
            items = ReactTestUtils.scryRenderedDOMComponentsWithTag(layoutComponent, 'li');

        assert.equal(content.type, 'ul');
        assert.equal(items.length, resources.length);
        _.each(items, function (item, index) {
            assert.equal(item.getDOMNode().textContent, resources[index]);
        });
    });
});
