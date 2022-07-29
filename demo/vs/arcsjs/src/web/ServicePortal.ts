const ServicePortal = class {
	constructor() {
		this.handlers = [];
	}
	add(handler) {
		this.handlers.push(handler);
		return this;
	}
	async handle(runtime, host, request) {
		log('handle:', request, 'handlers:', this.handlers.length);
		for (const handler of this.handlers) {
			const value = await handler(runtime, host, request);
			if (value !== undefined) {
				return value;
			}
		}
	}
};

export const Basic = {
	system: async (runtime, host, request) => {
		switch (request.msg) {
			case 'request-context': {
				return {
					runtime
				};
			}
		}
	},
	user: async (runtime, host, request) => {
		switch (request.msg) {
			case 'particle-error': {
				//console.error(error);
			}
		}
	}
};
export const Services = {
	system: new ServicePortal().add(Basic.system),
	user: new ServicePortal().add(Basic.user)
};
