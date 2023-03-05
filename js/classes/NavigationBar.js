import PreparingComponent from './PreparingComponent.js';
import { hub } from '../app.js';
// import Backdrop from "./Backdrop.js";
import Trapping from "./Trapping.js";

export default class NavigationBar {
	constructor(selfSelector, options = {}, __classes = {}) {
		new PreparingComponent(this, selfSelector); // Находим this.$self и другое
		if (!this.$self) {
			console.warn(`NavigationBar: не существует элемента с селектором "${selfSelector}" на странице!`);
			return;
		}
		this.hub = hub; // ! Хаб
		this.moduleType = String(this.constructor.name).toLowerCase();
		this.uid = hub.generateUID(this.moduleType);
		hub.ward(this);

		this.props = {
			displacementLevel: 10 // ! Уровень вытесняемости, чем выше тем менее вытесняем
		}
		this.statements = {
			isFreeze: false,
			isShown: false,
			// isShowedBeforeMassDisplace: undefined
		}

		this._listeners = {
			toggle: this.togglerHandler.bind(this),
			esc: this.escHandler.bind(this),
			outside: this.outsideHandler.bind(this),
			innerTrigger: this.innerTriggerHandler.bind(this),
		};


		this.opts = {
			backdropEnable: options.backdropEnable ?? false,
			backdropAnimated: options.backdropAnimated ?? false,
			fixDelayed: options.fixDelayed ?? false,
			/*  */
			togglerClass: options.togglerClass ?? 'navbar__toggler',
			/*  */
			closeOnClickMenuItem: options.closeOnClickMenuItem ?? false,
			_innerPointerEvent: options._innerPointerEvent ?? false,
			_innerPointerEventTag: options._innerPointerEventTag ?? 'span',
			preventDefaultOnClickMenuItem: options.preventDefaultOnClickMenuItem ?? false,
			/*  */
			trappingEnable: options.trappingEnable ?? true,
			trappingSelectors: options.trappingSelectors ?? ['.menu__link', '.logo a'],
		}
		Object.assign(this.opts, options);
		if (this.opts.trappingEnable) {
			this._trappingSettings = options._trappingSettings ?? {
				regions: {
					navbar: {
						domSelector: '.navbar',
						tabSelectors: this.opts.trappingSelectors,
					}
				}
			}
		}
		this.fixProps = {
			mainstay: '.intro',
			fixContainer: '.header__layout',
			fixedClass: 'js-fixed-on',
			fixedDelayedClass: 'js-fixed-off',
		}
		this._class = {
			navbar: __classes.navbarClass ?? 'navbar',
			toggler: this.opts.togglerClass ?? 'navbar__toggler', // Класс переключателя берем из опций!
			nbHelper: __classes.nbHelperClass ?? 'navbar__helper',
			// nav: __classes.navClass ?? 'nav',
			menu: __classes.menuClass ?? 'menu',
			mItems: __classes.mItemsClass ?? 'menu__link',
			ctrlsWrp: __classes.ctrlsWrpClass ?? 'ctrls-wrap',
			// psWrp: __classes.psWrpClass ?? 'plainsight-wrap',
			// ps: __classes.psClass ?? 'plainsight',
			// psWrpMainstay: __classes.psWrpMainstayClass ?? 'page-header',
		}
		// this.psWrpPos = __classes.psWrpPos ?? 'afterbegin'; // Куда относительно "опоры" будет добавлятся "обертка"
		// this.hop = __classes.hop ?? ['.logo']; // Элементы, которые должны "перепрыгивать" на "посадочное место" при трансформации меню

		this.desktopMinBP = '992px';
		this.mobileMaxBP = '991px';
		// this.desktopMinBP = '1000px';
		// this.mobileMaxBP = '999px';

		this.$toggler = this.$self.getElementsByClassName(this._class.toggler)[0] ?? document.body.getElementsByClassName(this._class.toggler)[0];
		// если внутри navbar'а не находим, то ищем за пределами
		// this.$toggler = this.$self.querySelector('.' + this._class.toggler);
		this.$nbHelper = this.$self.getElementsByClassName(this._class.nbHelper)[0];
		this.$ctrlsWrp = this.$self.getElementsByClassName(this._class.ctrlsWrp)[0];
		this.$menu = this.$nbHelper.getElementsByClassName(this._class.menu)[0];
		this.$mItems = this.$menu.getElementsByClassName(this._class.mItems);
		this.$mItemsArr = Array.from(this.$mItems);

		this.desktopStartMQ = window.matchMedia('(min-width: ' + this.desktopMinBP + ')');
		this.mobileStopMQ = window.matchMedia('(max-width: ' + this.mobileMaxBP + ')');

		this._toggler = {
			isEnabled: true,
			isVisible: undefined,
			isActive: false,
			stateClass: {
				active: 'is-active',
				visible: 'is-visible',
				enabled: 'is-enabled',
			}
		};
		this._navbar = {
			isMobile: undefined,
			isDesktop: undefined,
			isExpanded: undefined,
			isVisible: undefined,
			stateClass: {
				visible: 'is-visible',
				expanded: 'is-expanded',
			}
		};
		this._pagebody = {
			stateClass: {
				locked: 'is-locked'
			}
		};

		this.trapping = {};
		this.$ = {};
		// this.outerLayoutHelper = this.$self.closest('.header__layout');

		// this.hide = this.hide.bind(this);
		// this.show = this.show.bind(this);

		this.init();
		this.listen();
	}
	init() {
		if (this.opts.trappingEnable) {
			this.trapping = new Trapping(this._trappingSettings)
		}
		if (this.opts.backdropEnable) {
			this.$.backdrop = new Backdrop({ mainstay: '.navbar', animated: this.opts.backdropAnimated });
		}
		this.render();
		this.computeZIndex();

		// this.outerLayoutHelper.style.zIndex = this.props.zIndex + 1;
		this.$self.style.zIndex = this.props.zIndex;
		this.$nbHelper.style.zIndex = this.props.zIndex + 1;
		this.$toggler.closest('.ctrls-wrap').style.zIndex = this.props.zIndex + 2;
		// this.$self.style.zIndex = this.props.zIndex;
		// this.handlers('remove');
		// this.fixPos();
		if (this.opts.closeOnClickMenuItem) {
			this.$mItemsArr.map(item => {
				item.addEventListener('click', (e) => {
					if (this.opts.preventDefaultOnClickMenuItem) {
						e.preventDefault();
					}
					if (this.opts._innerPointerEvent) {
						// Ловим клик внутри пункта меню на тэге, указанном в опциях
						// (чтобы исключить реакцию на нажатие на декоративные элементы)
						if (e.target.tagName == String(this.opts._innerPointerEventTag).toUpperCase()) {
							this.togglerHandler();
						} else { return false; }
					} else {
						this.togglerHandler();
					}
				});
				item.addEventListener('keydown', (e) => {
					if (e.code == "Space" || e.code == "Enter") {
						if (this.opts.preventDefaultOnClickMenuItem) {
							e.preventDefault();
						}
						if (e.code == "Space") {
							e.preventDefault();
							e.target.click();
						}
						this.togglerHandler();
					}
				});
			});
		}
	}

	listen() {
		if (window.matchMedia && window.matchMedia('all').addListener) {
			// Работаем в safari < 13
			this.mobileStopMQ.addListener(this.render.bind(this));
		} else {
			// Работаем в остальных браузерах
			this.mobileStopMQ.addEventListener('change', this.render.bind(this));
		}
	}
	render() {
		this.setStates();
		this.drawHTML();
		this.backdropHandler();
		this.refreshBindingHandlers();
	}
	setStates() {
		this._navbar.isDesktop = this.desktopStartMQ.matches ? true : false;
		this._navbar.isMobile = this.mobileStopMQ.matches ? true : false;
		this._navbar.isVisible = this.desktopStartMQ.matches ? true : false; // Состояние видимости для навбара
		this._toggler.isVisible = this.desktopStartMQ.matches ? false : true; // Состояние видимости для тоглера
	}
	drawHTML() {
		this.drawClasses();
		this.drawAccessibility();
	}
	refreshBindingHandlers() {
		if (this.statements.isFreeze) return; // Если заморжен, то ничего не делаем, иначе:
		switch (this._navbar.isMobile) {
			case true:
				this.handlers('add', 'esc')
				this.handlers('add', 'toggle')
				break;
			case false:
				this.handlers('remove', 'esc')
				this.handlers('remove', 'toggle')
				break;
		}
	}
	drawClasses() {
		if (this._toggler.isVisible) {
			this.$toggler.classList.add(this._toggler.stateClass.visible);
		} else { this.$toggler.classList.remove(this._toggler.stateClass.visible); }
		if (this._toggler.isActive) {
			this.$toggler.classList.add(this._toggler.stateClass.active);
		} else { this.$toggler.classList.remove(this._toggler.stateClass.active); }
		if (this._navbar.isExpanded) {
			this.$self.classList.add(this._navbar.stateClass.expanded);
		} else {
			this.$self.classList.remove(this._navbar.stateClass.expanded);
		}
		if (this._navbar.isMobile && this._navbar.isExpanded) {
			document.body.classList.add(this._pagebody.stateClass.locked);
		} else { document.body.classList.remove(this._pagebody.stateClass.locked); }
	}
	drawAccessibility() {
		if (this.opts.trappingEnable) {
			if (!this._navbar.isDesktop) { // ! Если НЕ "статично"
				if (this._navbar.isExpanded) {
					this.trapping.enableOf('navbar');
					this.$toggler.tabIndex = 0;
					this.$toggler.focus();
				} else {
					this.trapping.reset();
					this.trapping.disableOf('navbar');
					this.$toggler.tabIndex = 0;
				}
				// this.$toggler.tabIndex = 0;
			} else {
				this.trapping.reset();
				this.$toggler.tabIndex = -1;
			}
		}
	}
	/* Методы для хаба : начало */
	// selfNormalize() { }
	selfDismiss(state) { // Отключение определенного функционала модуля, НЕ относящегося к видимости
		switch (state) {
			case 'work':
				// console.log('navbar selfDismiss work');
				if (!this._navbar.isMobile) { return; }

				if (this.opts.trappingEnable) {
					this.drawAccessibility();
				}
				this.statements.isFreeze = false;
				this.handlers('remove', 'esc');
				this.handlers('add', 'esc');
				break;
			// case 'leave':
			default:
				// console.log('navbar selfDismiss remove');
				if (!this._navbar.isMobile) { return; }

				if (this.opts.trappingEnable) {
					this.drawAccessibility();
				}
				this.statements.isFreeze = true;
				this.handlers('remove', 'esc');
				break;
		}
	}
	selfDisplace(state) { // Отключение видимости модуля (или перемещение)
		switch (state) {
			case 'work':
				if (!this._navbar.isMobile) { return; }
				if (this.statements.isShowedBeforeMassDisplace) { }
				this.show();
				break;
			default:
				if (!this._navbar.isMobile) { return; }
				this.hide();
				break;
		}
	}
	// selfDestruction(state) { }
	/* Методы для хаба : конец */

	togglerHandler() {
		if (this._toggler.isVisible && this._toggler.isEnabled) {
			this._toggler.isActive = this._toggler.isActive ? false : true;
		}
		if (!this._navbar.isDesktop) { // Если меню !НЕ "статично"
			this._navbar.isExpanded = this._navbar.isExpanded ? false : true;
			this.statements.isShown = this._navbar.isExpanded;
			this.hubHandler();
			if (this.statements.isShown) {
				setTimeout(() => {
					this.handlers('add', 'outside');
				}, 10)
			} else {
				this.handlers('remove', 'outside');
			}
		}

		this.drawHTML();

	}
	hide() {
		if (!this._navbar.isExpanded) return;
		this.togglerHandler();
	}
	show() {
		if (this._navbar.isExpanded) return;
		this.togglerHandler();
	}
	hubHandler() {
		if (this.statements.isShown) {
			this.hub.activate(this);
		} else {
			this.hub.deactivate(this);
		}
		this.backdropHandler();
	}
	backdropHandler() {
		if (this.opts.backdropEnable) {
			if (this._navbar.isMobile && this._navbar.isExpanded) {
				this.$.backdrop.show();
			} else {
				this.$.backdrop.hide();
			}
		}
	}
	handlers(action, type) {
		switch (action) {
			case 'remove':
				// console.log('Navbar - handlers: action=REMOVE ');
				switch (type) {
					case 'esc':
						// console.log('Navbar - handlers: type=ESC ');
						document.body.removeEventListener('keydown', this._listeners.esc);
						break;
					case 'outside':
						document.body.removeEventListener('click', this._listeners.outside);
						break;
					case 'toggle':
						// console.log('Navbar - handlers: type=TOGGLE ');
						this.$toggler.removeEventListener('click', this._listeners.toggle);
						break;
				}
				break;
			default:
				// console.log('Navbar - handlers: action=ADD ');
				switch (type) {
					case 'esc':
						// console.log('Navbar - handlers: type=ESC ');
						document.body.addEventListener('keydown', this._listeners.esc);
						break;
					case 'outside':
						document.body.addEventListener('click', this._listeners.outside);
						break;
					case 'toggle':
						// console.log('Navbar - handlers: type=TOGGLE ');
						this.$toggler.addEventListener('click', this._listeners.toggle);
						break;
				}
				break;
		}
	}
	escHandler(e) {
		if (e.code == 'Escape') {
			this.togglerHandler();
		}
	}
	outsideHandler(e) {
		if (!this.statements.isShown) {
			// console.log('Меню не показано!');
			return;
		}
		if (e.target.closest('.' + this._class.nbHelper)) {
			// console.log('Клик на меню!');
		} else {
			// console.log('Вне меню!');
			this.hide();
			this.handlers('remove', 'outside');
		}
	}
	innerTriggerHandler(e) {

	}

	fixPos() {
		if (!this.opts.fixDelayed) return;
		computeMainstayHeight(this);
		window.addEventListener('resize', () => { computeMainstayHeight(this) });
		fix(this);
		window.addEventListener('scroll', () => { fix(this) });
		function computeMainstayHeight(ctx) {
			let mainstay = document.querySelector(ctx.fixProps.mainstay);
			ctx.fixProps.mainstayHeight = parseFloat(window.getComputedStyle(mainstay).height);
		}
		function fix(ctx) {
			// console.log('fix: ', window.pageYOffset, ctx.fixProps.mainstayHeight);
			let $fixContainer = document.querySelector(ctx.fixProps.fixContainer);
			if (window.pageYOffset >= 30) {
				setTimeout(() => {
					$fixContainer.classList.remove(ctx.fixProps.fixedDelayedClass);
					$fixContainer.classList.add(ctx.fixProps.fixedClass);
				}, 150);
			} else {
				setTimeout(() => {
					$fixContainer.classList.add(ctx.fixProps.fixedDelayedClass);
					$fixContainer.classList.remove(ctx.fixProps.fixedClass);
				}, 150);
			}
		}
	}

	computeZIndex() {
		let highestZIndex = 0;
		let allElements = document.body.getElementsByTagName('*');

		for (let i = 0; i < allElements.length - 1; i++) {

			let currentZIndex = parseInt(window.getComputedStyle(allElements[i]).zIndex);
			// if (currentZIndex) {
			// 	console.log(allElements[i], currentZIndex);
			// }
			if (currentZIndex > highestZIndex) {
				highestZIndex = currentZIndex;
			}
		}
		this.props.zIndex = highestZIndex;
		// console.log(highestZIndex);
		return highestZIndex + 2;
	}

}