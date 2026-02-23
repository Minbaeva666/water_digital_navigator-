import logger from './config/loggerConfig';
import { hardenConsoleInProduction } from './config/hardenConsole';

hardenConsoleInProduction();
logger.info('Server starting...');

import './server';