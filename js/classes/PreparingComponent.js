export default class PreparingComponent {
	constructor(ctx, componentSelector) {
		if (componentSelector && componentSelector.length > 1) { // Можно добавить полную валидацию селектора
			if (componentSelector.includes(".")) {
				ctx._selfClass = componentSelector.replace(/\./g, "");
				ctx.$self = document.getElementsByClassName(ctx._selfClass)[0];
				ctx.selfSelector = componentSelector;
			}
			if (componentSelector.includes("#")) {
				ctx._selfId = componentSelector.replace(/\#/g, "");
				let $self = document.getElementById(ctx._selfId);
				if ($self) {
					ctx._selfClass = $self.className.replace(/\./g, "");
					ctx.$self = $self;
					ctx.selfSelector = componentSelector;
				}
			}
			if (!componentSelector.includes("#") && !componentSelector.includes(".")) {
				let $self = document.querySelectorAll(componentSelector);
				if ($self) {
					ctx.$self = $self;
					ctx.selfSelector = componentSelector;
				}
			}
			ctx._selfSelectorValue = ctx._selfClass ?? ctx._selfId ?? ctx.selfSelector;
			// console.warn(ctx.$self, ctx.selfSelector, ctx._selfSelectorValue);
		} else {
			console.warn(`Неправильный селектор для модуля ${ctx}! componentSelector = ${componentSelector}`);
		}
	}
}