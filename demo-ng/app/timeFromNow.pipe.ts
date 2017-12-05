import { Pipe, PipeTransform } from "@angular/core";
import moment = require("moment");

@Pipe({ name: "timeFromNow" })
export class TimeFromNow implements PipeTransform {
    transform(date: Date): string {
        return moment(date).fromNow();
    }
}
