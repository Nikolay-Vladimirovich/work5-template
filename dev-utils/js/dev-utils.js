// import * as pixelperfect from "./dev-modules/pixelperfect.js";
window.addEventListener('load', pixelperfect);

function pixelperfect() {
	const d = document;
	const b = d.body;
	d.addEventListener('keydown', (event) => {
		// Переключение видиомсти фона
		// Вся страница
		if ((event.code == 'KeyQ') && (event.ctrlKey || event.metaKey)) {
			b.classList.toggle('dev--overlayed');
			event.preventDefault();
		}
		// Блоки по отдельности
		if ((event.code == 'KeyD') && (event.ctrlKey || event.metaKey)) {
			b.classList.toggle('dev--overlayed-fullpage');
			event.preventDefault();
		}

		// Смещение фона по вертикали к нужному блоку
		if ((event.code == 'Digit1') && (event.ctrlKey || event.metaKey)) {
			b.classList.toggle('dev--overlayed-no-header');
			event.preventDefault();
		}

		// Смещение фона по вертикали к нужному блоку
		if ((event.code == 'KeyG') && (event.ctrlKey || event.metaKey)) {
			b.classList.toggle('dev--containers-highlighted');
			event.preventDefault();
		}

		// Обводка
		if ((event.code == 'KeyB') && (event.ctrlKey || event.metaKey)) {
			b.classList.toggle('dev--outlined');
			event.preventDefault();
		}
		// Обводка на разметку от js-плагинов
		if ((event.code == 'KeyJ') && (event.ctrlKey || event.metaKey)) {
			b.classList.toggle('dev--js-ext-outlined');
			event.preventDefault();
		}

		if ((event.code == 'KeyE') && (event.ctrlKey || event.metaKey)) {
			b.classList.remove('dev--outlined');
			b.classList.remove('dev--containers-highlighted');
			b.classList.remove('dev--overlayed-fullpage');
			b.classList.remove('dev--overlayed');
			b.classList.remove('dev--overlayed-no-header');
			event.preventDefault();
		}
		
	})
}