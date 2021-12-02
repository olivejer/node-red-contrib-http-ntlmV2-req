module.exports = function (RED) {
    function HttpNtlmReqConfig(n) {
        RED.nodes.createNode(this, n);
        this.user = n.user;
        this.pass = n.pass;
        this.key = n.key;
        this.cert = n.cert;
        this.token = n.token;
        this.doman = n.doman;
        this.parsejson = n.parsejson;
    }

    RED.nodes.registerType("http-ntlm-req-config", HttpNtlmReqConfig);
}