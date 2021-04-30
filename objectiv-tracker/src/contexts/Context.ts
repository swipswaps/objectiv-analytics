import { ButtonContext } from './ButtonContext';
import { DeviceContext } from './DeviceContext';
import { ErrorContext } from './ErrorContext';
import { LinkContext } from './LinkContext';
import { TestContext } from './TestContext';
import { WebDocumentContext } from './WebDocumentContext';

export type Context = TestContext | ErrorContext | ButtonContext | LinkContext | WebDocumentContext | DeviceContext;
