/*
*	dateWithAge filter.
*/
filters.dateWithAge=function(){
	"ngInject";
	return function(date){
		return date + ' (28)';
	};
};
