// import * as myFunctions from "./functions/functions.js";
// myFunctions.isWebp();

import Hub from "./classes/Hub.js";
export const hub = new Hub();

import NavigationBar from "./classes/NavigationBar.js";
const navbar = new NavigationBar('.navbar', {
	togglerClass: 'navbar__toggler', },
	{
		nbHelperClass: 'nav-wrap',
	}
);
