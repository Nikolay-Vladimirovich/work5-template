// import * as myFunctions from "./functions/functions.js";
// myFunctions.isWebp();

import Hub from "./classes/Hub.js";
export const hub = new Hub();

import NavigationBar from "./classes/NavigationBar.js";
const navbar = new NavigationBar('.navbar', {
	togglerClass: 'navbar__toggler',
},
	{
		nbHelperClass: 'nav-wrap',
	}
);

import Modal from 'bootstrap/js/dist/modal.js';
const modalCreateShop = new Modal('#createShop');

import Mediator from "./classes/Mediator.js";
const modalMediatedCreateShop = new Mediator(modalCreateShop, {
	componentType: 'bootstrap',
	hideEvent: 'hidden.bs.modal',
	showEvent: 'shown.bs.modal',
	hideMethod: null,
	showMethod: null,
});