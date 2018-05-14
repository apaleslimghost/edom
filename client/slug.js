import shortId from '@quarterto/short-id';
import paramCase from 'param-case';

export default title => `${paramCase(title)}-${shortId()}`;
