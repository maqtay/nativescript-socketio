import { getResources, setResources, run } from 'tns-core-modules/application';
import * as moment from 'moment';



const resources = getResources();
resources['timeFromNow'] = (date) => moment(date).fromNow();

setResources(resources);

run({moduleName: 'app-root'});