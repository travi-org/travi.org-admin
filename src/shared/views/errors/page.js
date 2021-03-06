import React from 'react';
import {number} from 'prop-types';
import {ServerError, NotFound} from '@travi/admin.travi.org-components';
import {NOT_FOUND} from 'http-status-codes';
import Wrap from '../theme/wrap/component';

function error(code) {
  switch (code) {
    case NOT_FOUND:
      return <NotFound />;
    default:
      return <ServerError />;
  }
}

export default function ErrorPage({statusCode}) {
  return <Wrap>{error(statusCode)}</Wrap>;
}

ErrorPage.displayName = 'ErrorPage';

ErrorPage.propTypes = {
  statusCode: number
};
