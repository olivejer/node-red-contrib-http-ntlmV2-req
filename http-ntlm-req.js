module.exports = function (RED) {
	function HttpNtlmReqNode(config) {
		var httpntlm = require('httpntlm');

		RED.nodes.createNode(this, config);
		const node = this;

		const resetStatus = () => node.status({});
		const raiseError = (text, msg) => {
			node.status({ fill: "red", shape: "dot", text: text });
			node.error(text, msg);
		};

		node.name = config.name;
		node.url = config.url;
		node.method = config.method;
		node.authconf = RED.nodes.getNode(config.auth);

		resetStatus();

		node.on('input', function (msg) {
			const requestCallback = (err, res) => {
				resetStatus();

				if (res !== undefined && res.body !== undefined) {
					msg.payload = node.authconf.parsejson ? JSON.parse(res.body) : res.body;
					if (res.statusCode !== 200) {
						raiseError('Response from server: ' + res.statusCode, msg);
					}
				} else {
					raiseError(err.message, msg);
				}

				node.send(msg);
			};

			var defaultHeader = msg.headers || {};
			defaultHeader['Content-Type'] = 'application/json';

			const connData = {
				username: node.authconf.user,
				password: node.authconf.pass,
				domain: node.authconf.doman,
				workstation: '',
				headers: defaultHeader
			};

			switch (node.method) {
				case 0: // GET
					{
						connData.url = node.url + msg.payload;
						httpntlm.get(connData, requestCallback);
						break;
					}
				case 1: // POST
					{
						connData.url = node.url;
						connData.body = msg.payload;
						httpntlm.post(connData, requestCallback);
						break;
					}
				case 2: // PUT
					{
						connData.url = node.url;
						connData.body = msg.payload;
						httpntlm.put(connData, requestCallback);
						break;
					}
				default:
					{
						raiseError('No method defined!', msg);
						break;
					}
			}
		});
	}

	RED.nodes.registerType("http-ntlm-req", HttpNtlmReqNode);
}
