import { getResources, setResources, run } from 'tns-core-modules/application';
import moment = require('moment');



const resources = getResources();
resources['timeFromNow'] = (date) => moment(date).fromNow();

setResources(resources);

run({moduleName: 'app-root'});