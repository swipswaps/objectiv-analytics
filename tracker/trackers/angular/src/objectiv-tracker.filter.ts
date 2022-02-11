/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { makeIdFromString } from '@objectiv/tracker-browser';

/**
 * A PipeTransform to convert the given string in an id-like string using Core Tracker makeIdFromString
 */
@Pipe({
  name: 'makeIdFromString',
})
export class MakeIdFromString implements PipeTransform {
  transform(inputString: string): string | null {
    return makeIdFromString(inputString);
  }
}
