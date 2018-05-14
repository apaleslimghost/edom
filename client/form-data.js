import formJson from '@quarterto/form-json';
import prevent from './prevents-default';

const getFormData = prevent(ev => {
	try {
		return formJson(ev.target);
	} finally {
		ev.target.reset();
	}
});

export default getFormData;
