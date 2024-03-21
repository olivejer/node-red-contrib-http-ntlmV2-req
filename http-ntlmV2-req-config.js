module.exports = function (RED) {
    function HttpNtlmv2ReqConfig(n) {
        RED.nodes.createNode(this, n);
        this.user = n.user;
        this.pass = n.pass;
        this.doman = n.doman;
    }

    RED.nodes.registerType("http-ntlmV2-req-config", HttpNtlmReqConfig);
}