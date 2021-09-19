import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {

  transform(miliseconds: number, format?: string): string {
    let time = this.getTime(miliseconds);
    let output: string = '';
    if (format){
      output = this.parseFormat(format,time);
    }else {
      output = this.defaultFormat(time);
    }
    return output;
  }

  private getTime(miliseconds: number): Time{
    let time: Time = {days: 0, hours: 0, minutes: 0, seconds: 0, miliseconds: 0};
    time.miliseconds = miliseconds;
    time.seconds = Math.floor(miliseconds/1000);
    time.miliseconds = time.miliseconds -  time.seconds*1000;
    time.minutes = Math.floor(time.seconds/60);
    time.seconds = time.seconds -  time.minutes*60;
    time.hours = Math.floor(time.minutes/60);
    time.minutes = time.minutes -  time.hours*60;
    time.days = Math.floor(time.hours/24);
    time.hours = time.hours -  time.days*24;
    return time;
  }

  private defaultFormat(time: Time): string{
    let output: string = '';

    output = this.formatMiddleDays(time.days,false);
    output += this.formatMiddleHours(time.hours, false);
    output += this.formatMiddleMinutes(time.minutes, false);
    output += this.formatMiddleSeconds(time.seconds, false);
    output += this.formatMiddleMiliseconds(time.miliseconds, false);

    return output;
  }

  private parseFormat(format: string, time: Time): string{
    let structure = this.getFormatStructure(format);
    this.adjustTimeDown(time,structure);
    this.adjustTimeUp(time,structure);
    return this.buidlString(time, structure);
  }

  private adjustTimeDown(time: Time, structure: Array<Object>){
    if (!this.structureHasType('d',structure)) time.hours = time.days*24 + time.hours;
    if (!this.structureHasType('h',structure)) time.minutes = time.hours*60 + time.minutes;
    if (!this.structureHasType('M',structure)) time.seconds = time.minutes*60 + time.seconds;
    if (!this.structureHasType('s',structure)) time.miliseconds = time.seconds*1000 + time.miliseconds;
  }

  private adjustTimeUp(time: Time, structure: Array<Object>){
    if (!this.structureHasType('m',structure)) time.seconds = time.miliseconds > 500? time.seconds+1 : time.seconds;
    if (!this.structureHasType('s',structure)) time.minutes = time.seconds > 30? time.minutes+1 : time.minutes;
    if (!this.structureHasType('M',structure)) time.hours = time.minutes > 30? time.hours+1 : time.hours;
    if (!this.structureHasType('h',structure)) time.days = time.hours > 12? time.days+1 : time.days;
  }

  private buidlString(time: Time, structure: Array<Object>): string {
    let output = '';
    structure.forEach((strc)=>{
      output += strc.hasOwnProperty('id')? this.printData(strc as FormatType,time): (strc as SeparatorType).separator;
    });
    return output;
  }

  private getFormatStructure(format: string): Array<Object>{
    let structure: Array<Object>=[];
    let currentChar: string = '';
    let currentLength: number = 0;
    let formatChars = ['d','M','h','s','m'];
    for(let char of format){
      if (formatChars.includes(char)){
        if (currentChar == char){
          currentLength++;
        }else{
          this.addStructure(currentChar,currentLength, false,structure);
          currentChar = char;
          currentLength = 1;
        }
      } else {
        if (currentLength > 0){
          this.addStructure(currentChar,currentLength, char == '?', structure);
          currentChar = char == '?'? '': char;
        } else {
          currentChar += char;
        }
        currentLength = 0;
      }
    }
    if(format && format.length > 0 && format[format.length-1] != '?') this.addStructure(currentChar,currentLength,false, structure);
    return structure;
  }

  private addStructure(currentChar: string, currentLength: number, optional: boolean, structure: Array<Object>){
    if (currentChar){
      if (currentLength > 0){
        structure.push({
          id: currentChar,
          len: currentLength,
          'optional': optional,
        } as FormatType);
      } else {
        structure.push({
          separator: currentChar
        } as SeparatorType);
      }
    }
  }

  private structureHasType(type: string, structure: Array<Object>): boolean{
    return (structure && (structure.find((strc)=> strc.hasOwnProperty('id') && (strc as FormatType).id == type) ))? true : false;
  }

  private printData(type: FormatType, time: Time):string{
    let handler={
      'd': ()=>{return this.addDays(type.len, type.optional, time.days)},
      'h': ()=>{return this.addHours(type.len, type.optional, time.hours)},
      'M': ()=>{return this.addMinutes(type.len, type.optional, time.minutes)},
      's': ()=>{return this.addSeconds(type.len, type.optional, time.seconds)},
      'm': ()=>{return this.addMiliseconds(type.len, type.optional, time.miliseconds)}
    }[type.id];
    return handler? handler(): '';
  }

  private addDays(type: number, optional: boolean, days: number): string{
    return this.addTime(type,optional,days,this.formatMiddleDays,this.formatLargeDays);
  }

  private addHours(type: number, optional: boolean, hours: number): string{
    return this.addTime(type,optional,hours,this.formatMiddleHours,this.formatLargeHours);
  }

  private addMinutes(type: number, optional: boolean, minutes: number): string{
    return this.addTime(type,optional,minutes,this.formatMiddleMinutes,this.formatLargeMinutes);
  }

  private addSeconds(type: number, optional: boolean, seconds: number): string{
    return this.addTime(type,optional,seconds,this.formatMiddleSeconds,this.formatLargeSeconds);
  }

  private addMiliseconds(type: number, optional: boolean, miliseconds: number): string{
    return this.addTime(type,optional,miliseconds,this.formatMiddleMiliseconds,this.formatLargeMiliseconds);
  }

  private addTime(type: number, optional: boolean, time: number, formatMiddle: Function, formatLarge: Function): string{
    let handler={
      '1': ()=>{return this.formatShort(time,false);},
      '2': ()=>{return this.formatShort(time,true);},
      '3': ()=>{return formatMiddle(time,true);},
      '4': ()=>{return formatLarge(time,true);}
    }[type];
    return ((time == 0 && optional) || !handler)? '' : handler();
  }

  private formatLargeDays(days: number, forceValue: boolean){
    return this.formatText(days,forceValue, 'days', 'day');
  }

  private formatMiddleDays(days: number, forceValue: boolean){
    return this.formatText(days,forceValue, 'd', 'd');
  }

  private formatLargeHours(hours: number, forceValue: boolean){
    return this.formatText(hours,forceValue, 'hours', 'hour');
  }

  private formatMiddleHours(hours: number, forceValue: boolean){
    return this.formatText(hours,forceValue, 'hrs', 'hr');
  }

  private formatLargeMinutes(minutes: number, forceValue: boolean){
    return this.formatText(minutes,forceValue, 'minutes', 'minute');
  }

  private formatMiddleMinutes(minutes: number, forceValue: boolean){
    return this.formatText(minutes,forceValue, 'mins', 'min');
  }

  private formatLargeSeconds(seconds: number, forceValue: boolean){
    return this.formatText(seconds,forceValue, 'seconds', 'second');
  }

  private formatMiddleSeconds(seconds: number, forceValue: boolean){
    return this.formatText(seconds,forceValue, 'secs', 'sec');
  }

  private formatLargeMiliseconds(miliseconds: number, forceValue: boolean){
    return this.formatText(miliseconds,forceValue, 'miliseconds', 'milisecond');
  }

  private formatMiddleMiliseconds(miliseconds: number, forceValue: boolean){
    return this.formatText(miliseconds,forceValue, 'ms', 'ms');
  }

  private formatShortMiliseconds(miliseconds: number, twoDigits: boolean){
    return miliseconds > 10? miliseconds.toString() : '0'+miliseconds.toString();
  }

  private formatShort(time: number, twoDigits: boolean){
    return time > 10? time.toString() : '0'+time.toString();
  }

  private formatText(time: number, forceValue: boolean, singular: string, plural: string){
    singular = singular.trim() + ' ';
    plural = plural.trim() + ' ';
    return time > 0? time.toString() + (time > 1? plural: singular): (forceValue?'0 ' + plural: '');
  }
}

interface Time{
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  miliseconds: number
}

interface FormatType {
  id: string;
  len: number;
  optional: boolean;
}

interface SeparatorType{
  separator: string;
}

