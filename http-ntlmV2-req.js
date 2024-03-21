module.exports = function (RED) {
	function HttpNtlmV2ReqNode(config) {
		var httpntlm = require('httpntlm');
		var ntlm = httpntlm.ntlm;

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
		node.protocol = config.protocol;
		
		node.authconf = RED.nodes.getNode(config.auth);

		resetStatus();

		node.on('input', function (msg) {
			const requestCallback = (err, res) => {
				resetStatus();

				if (res !== undefined && res.body !== undefined) {
					//msg.payload = JSON.parse(res.body);
					msg.payload = res.body;
					if(res.statusCode>=400) {
						raiseError('Response from server: ' + res.statusCode, msg);
					}
				} else {
					raiseError(err.message, msg);
				}

				node.send(msg);
			};

			var params = (typeof msg.params==='undefined')?"":msg.params;
			var url = (typeof msg.url==='undefined')?node.url:msg.url;
			
			switch(parseInt(node.protocol)){ 
				case 1: //ntlmV1
					{
						const connData = {
							username: node.authconf.user,
							password: node.authconf.pass,
							domain: node.authconf.doman,
							workstation: '',
							headers: (typeof msg.headers==='undefined')?{}:msg.headers
						};
						break;
					}
				case 2: //ntlmV2
					{
						const connData = {
							username: node.authconf.user,
							lm_password: httpntlm.ntlm.create_LM_hashed_password(node.authconf.pass),
							nt_password: httpntlm.ntlm.create_NT_hashed_password(node.authconf.pass),
							domain: node.authconf.doman,
							workstation: '',
							headers: (typeof msg.headers==='undefined')?{}:msg.headers
						};
						break;
					}
				
				default:
					{
						raiseError('No protocol defined!', msg);
						break;
					}
			}
		
			switch(parseInt(node.method)){
				case 0: // GET
					{
						connData.url = url + params;
						httpntlm.get(connData, requestCallback);
						break;
					}
				case 1: // POST
					{
						connData.url = url + params;
						if(msg.payload!==undefined){
							connData.body = JSON.stringify(msg.payload);
							connData.headers['Content-Type'] = (typeof connData.headers['Content-Type']==='undefined')?'application/json':connData.headers['Content-Type'];
						}
						httpntlm.post(connData, requestCallback);
						break;
					}
				case 2: // PUT
					{
						connData.url = url + params;
						if(msg.payload!==undefined){
							connData.body = JSON.stringify(msg.payload);
							connData.headers['Content-Type'] = (typeof connData.headers['Content-Type']==='undefined')?'application/json':connData.headers['Content-Type'];
						}
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

	RED.nodes.registerType("http-ntlmV2-req", HttpNtlmV2ReqNode);
}
