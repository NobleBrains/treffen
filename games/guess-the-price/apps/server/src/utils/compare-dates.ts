export const compareDates = (startDate: Date, endDate: Date) => {
	return (endDate.getTime() - startDate.getTime()) / 1000;
};
