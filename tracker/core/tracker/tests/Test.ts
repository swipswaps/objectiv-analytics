// import {
//   AbstractContext,
//   AbstractGlobalContext,
//   AbstractItemContext,
//   AbstractLocationContext,
//   AbstractSectionContext,
//   ActionContext,
//   DeviceContext,
//   InputContext,
//   SectionContext,
//   WebDocumentContext,
// } from '@objectiv/schema';
//
// const sectionContext: SectionContext = {
//   id: '1',
//   _context_type: 'SectionContext',
//   _location: true,
//   _section: true,
// };
// const webDocumentContext: WebDocumentContext = {
//   _location: true,
//   _section: true,
//   id: '1',
//   _context_type: 'WebDocumentContext',
//   url: 'lol',
// };
// const deviceContext: DeviceContext = {
//   _global: true,
//   id: 'device',
//   _context_type: 'DeviceContext',
//   userAgent: 'lol',
// };
//
// const inputContext: InputContext = {
//   _item: true,
//   _location: true,
//   id: 'device',
//   _context_type: 'InputContext',
// };
//
// const actionContext: ActionContext = {
//   _action: true,
//   path: '',
//   text: '',
//   _item: true,
//   _location: true,
//   id: 'device',
//   _context_type: 'ActionContext',
// };
//
// const logContext = (c: AbstractContext) => {
//   console.log(c);
// };
// logContext(sectionContext);
// logContext(webDocumentContext);
// logContext(deviceContext);
// logContext(inputContext);
// logContext(actionContext);
//
// const logGlobalContext = (c: AbstractGlobalContext) => {
//   console.log(c);
// };
// logGlobalContext(sectionContext);
// logGlobalContext(webDocumentContext);
// logGlobalContext(deviceContext);
// logGlobalContext(inputContext);
// logGlobalContext(actionContext)
//
// const logLocationContext = (c: AbstractLocationContext) => {
//   console.log(c);
// };
// logLocationContext(sectionContext);
// logLocationContext(webDocumentContext);
// logLocationContext(deviceContext);
// logLocationContext(inputContext);
// logLocationContext(actionContext);
//
// const logSectionContext = (c: AbstractSectionContext) => {
//   console.log(c);
// };
// logSectionContext(sectionContext);
// logSectionContext(webDocumentContext);
// logSectionContext(deviceContext);
// logSectionContext(inputContext);
// logSectionContext(actionContext);
//
// const logItemContext = (c: AbstractItemContext) => {
//   console.log(c);
// };
// logItemContext(sectionContext);
// logItemContext(webDocumentContext);
// logItemContext(deviceContext);
// logItemContext(inputContext);
// logItemContext(actionContext);
