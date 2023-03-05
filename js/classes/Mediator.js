import PreparingComponent from './PreparingComponent.js';
import { hub } from '../app.js';

export default class Mediator {
	constructor(component, options = {}) {
		// new PreparingComponent(this, selfSelector);
		// if (!this.$self) {
		// 	console.warn(`ModalMediator: не существует элемента с селектором "${selfSelector}" на странице!`);
		// 	return;
		// }

		this.component = component;
		this.$component = component._element;
		if(!this.$component) this.$component = component;

		console.log(this.component);
		console.log(this.$component);
		if (hub) {
			this.hub = hub; // ! Хаб
			this.moduleType = String(this.constructor.name).toLowerCase();

			this.uid = hub.generateUID(this.moduleType);
			hub.ward(this);
		}
		console.log(hub.wards);

		this.opts = {
			componentType: options.componentType ?? 'custom',
			hideEvent: null,
			showEvent: null,
			hideMethod: null,
			showMethod: null,
		}
		Object.assign(this.opts, options);

		this.props = {
			displacementLevel: 100 // ! Уровень вытесняемости, чем выше тем менее вытесняем
		}
		this.statements = {
			isFreeze: false,
			isShown: false
		}
		this.init();
	}
	init() {
		// this.$modal = new Modal(this.$self);
		// this.$modal = Modal.getInstance();

		this.$component.addEventListener(this.opts.hideEvent, (event) => {
			this.statements.isShown = false;
			this.statements.isFreeze = true;
			if (this.hub) {
				this.hub.deactivate(this);
			}
		});
		this.$component.addEventListener(this.opts.showEvent, (event) => {
			this.statements.isShown = true;
			this.statements.isFreeze = false;
			if (this.hub) {
				this.hub.activate(this);
			}
		});
	}
	/* Методы для взаимодейтсвия из хаба : начало */
	selfDismiss(state) { // Отключение определенного функционала модуля, НЕ относящегося к видимости
		switch (state) {
			case 'leave':
				//
				this.component.hide();
				break;
			case 'work':
				//
				
				break;
		}
	}
	selfDisplace(state) { // Отключение видимости модуля (или перемещение)
		switch (state) {
			case 'leave':
				this.component.hide();
				break;
			case 'work':
				this.component.show();
				break;
		}
	}
	/* Методы для взаимодейтсвия из хаба : конец */
}
