import { ControllerError } from '../controller-error';

export const checkControllerError = (error: Error, defaultMessage: string = 'Unknown server error.') => {
	if (error instanceof ControllerError) {
		throw error;
	}
	throw new ControllerError(defaultMessage, 500);
};
