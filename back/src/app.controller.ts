import { Controller, Get } from 'danet/mod.ts';
import {Render} from "https://deno.land/x/danet@1.7.4/src/renderer/decorator.ts";

@Controller('')
export class AppController {
  constructor() {
  }

  @Get('')
  helloWorld() {
    return 'Hello World';
  }
}
