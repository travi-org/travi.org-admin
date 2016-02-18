'use strict';

const
    React = require('react'), //eslint-disable-line no-unused-vars
    dom = require('react-dom'),
    reactRouter = require('react-router'),
    proxyquire = require('proxyquire');

suite('routes', () => {
    const
        Router = reactRouter.Router,
        routesFactory = proxyquire('../../../lib/shared/routes.jsx', {
            './views/theme/wrap.jsx': React.createClass({
                render() {
                    return <div>wrapper { this.props.children }</div>;
                }
            }),
            './views/index.jsx': (React) => () => <div>index</div>,                     //eslint-disable-line no-shadow
            './views/errors/not-found.jsx': (React) => () => <div>not-found</div>,      //eslint-disable-line no-shadow
            './views/resource-list.jsx': React.createClass({
                render: () => <div>resources</div>
            }),
            './views/resource.jsx': React.createClass({
                render: () => <div>resource</div>
            })
        });
    let node,
        hydrater,
        routes;

    beforeEach(() => {
        hydrater = sinon.spy();
        routes = routesFactory(hydrater);
        node = document.createElement('div');
    });

    afterEach(() => {
        hydrater = null;
        dom.unmountComponentAtNode(node);
    });

    test('that the root route is defined', () => {
        dom.render(
            <Router history={reactRouter.createMemoryHistory('/')}>
                { routes }
            </Router>, node, () => {
                assert.equals(node.textContent, 'wrapper index');
            }
        );
    });

    test('that the not-found route is defined', () => {
        dom.render(
            <Router history={reactRouter.createMemoryHistory('/foo/bar/baz')}>
                { routes }
            </Router>, node, () => {
                assert.equals(node.textContent, 'wrapper not-found');
                refute.called(hydrater);
            }
        );
    });

    test('that the rides route is defined', () => {
        dom.render(
            <Router history={reactRouter.createMemoryHistory('/rides')}>
                { routes }
            </Router>, node, () => {
                assert.equals(node.textContent, 'wrapper resources');
                assert.calledOnce(hydrater);
            }
        );
    });

    test('that the ride route is defined', () => {
        dom.render(
            <Router history={reactRouter.createMemoryHistory('/rides/8')}>
                { routes }
            </Router>, node, () => {
                assert.equals(node.textContent, 'wrapper resource');
                assert.calledOnce(hydrater);
            }
        );
    });

    test('that the users route is defined', () => {
        dom.render(
            <Router history={reactRouter.createMemoryHistory('/users')}>
                { routes }
            </Router>, node, () => {
                assert.equals(node.textContent, 'wrapper resources');
                assert.calledOnce(hydrater);
            }
        );
    });

    test('that the user route is defined', () => {
        dom.render(
            <Router history={reactRouter.createMemoryHistory('/users/4')}>
                { routes }
            </Router>, node, () => {
                assert.equals(node.textContent, 'wrapper resource');
                assert.calledOnce(hydrater);
            }
        );
    });
});
