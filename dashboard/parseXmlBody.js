import { XMLParser } from 'fast-xml-parser/src/fxp.js';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
}); 