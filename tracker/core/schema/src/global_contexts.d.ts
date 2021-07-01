import {AbstractGlobalContext} from './abstracts';
export interface DeviceContext extends AbstractGlobalContext {
	readonly _context_type: 'DeviceContext';
	'user-agent': string;
}
export interface ErrorContext extends AbstractGlobalContext {
	readonly _context_type: 'ErrorContext';
	message: string;
}
export interface CookieIdContext extends AbstractGlobalContext {
	readonly _context_type: 'CookieIdContext';
	cookie_id: string;
}
export interface SessionContext extends AbstractGlobalContext {
	readonly _context_type: 'SessionContext';
	hitNumber: integer;
}
export interface HttpContext extends AbstractGlobalContext {
	readonly _context_type: 'HttpContext';
	host: string;
	'user-agent': string;
	remote_addr: string;
}