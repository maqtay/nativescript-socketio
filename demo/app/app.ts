import { start, getResources, setResources } from "tns-core-modules/application/application";
import moment = require("moment");

start({ moduleName: "login" });

const resources = getResources();
resources["timeFromNow"] = (date) => moment(date).fromNow();

setResources(resources);
