'use strict';

const
    proxyquire = require('proxyquire'),
    redux = require('redux'),
    Immutable = require('immutable'),
    any = require('../../../helpers/any'),
    reducer = require('../../../../lib/shared/store/reducer'),
    sinon = require('sinon'),
    assert = require('chai').assert;

suite('store creation for development', () => {
    let sandbox;
    const
        enhancer = any.simpleObject(),
        DevTools = {
            instrument() {}
        },
        configureStore = proxyquire('../../../../lib/shared/store/configure.dev', {
            '../views/dev/dev-tools.jsx': DevTools
        });

    setup(() => {
        sandbox = sinon.sandbox.create();
        sandbox.stub(redux, 'createStore');
        sandbox.stub(DevTools, 'instrument').returns(enhancer);
    });

    teardown(() => {
        sandbox.restore();
    });

    test('that redux store is created from provided initial state', () => {
        const
            initialState = any.simpleObject(),
            store = any.simpleObject();
        redux.createStore.withArgs(reducer, Immutable.fromJS(initialState), enhancer).returns(store);

        assert.equal(configureStore(initialState), store);
    });
});
