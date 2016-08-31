import _extend from 'lodash/extend';
import { environmentConstants, commonConstants } from './constants';

let
  constants,
  env = process.env.BUILD || process.env.NODE_ENV || 'development',
  finalEnvironmentConstants = environmentConstants[env];

// Common keys will be overwritten by environment-specific keys
// with the same name
constants = _extend(commonConstants, finalEnvironmentConstants);

export default constants;
