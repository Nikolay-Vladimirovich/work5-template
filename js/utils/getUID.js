export default class getUID {
	constructor(options = {}) {
		// this.prefix = prefix ?? 'unnamedComponent',
		this.opts = {
			// Опции по-умолчанию:
			context: options.context ?? this
		};
		Object.assign(this.opts, options);
		this.num = this.counter();
	}
	generate(prefix){
		// return prefix + 'N' + this.num('+') + 'R' + parseInt(Math.random() * 1000000);
		return prefix + this.num('+');
	}
	counter() {
		let i = 0;
		return function (to) {
			switch (to) {
				case '+':
					i++;
					break;
				case '-':
					i--;
					break;
			}
			return i;
		}
	}
}